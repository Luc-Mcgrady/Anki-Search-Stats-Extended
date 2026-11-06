import { GraphsRequest, GraphsResponse } from "../src/ts/proto/anki/stats_pb"

jest.mock("svelte/store", () => ({ get: (store: { value: boolean }) => store.value }))
jest.mock("../src/ts/stores", () => ({
    alwaysAllTime: { value: false },
    cids: { set: jest.fn() },
    data: { set: jest.fn() },
    graphsRequest: {
        value: null,
        set: jest.fn(function (value) {
            this.value = value
        }),
    },
    not_suspended_data: { set: jest.fn() },
}))
jest.mock("../src/ts/search", () => ({ search: jest.fn().mockResolvedValue([123]) }))

const initialFetch = global.fetch

afterEach(() => {
    global.fetch = initialFetch
})

test.each([
    [false, 365, 2],
    [false, 0, 2],
    [true, 0, 2],
    [true, 365, 3],
])("alwaysAllTime=%s, days=%s makes %s graph requests", async (allTime, days, count) => {
    jest.resetModules()
    const bytes = new Uint8Array(new GraphsResponse().toBinary())
    const responses: Response[] = []
    const transport = jest.fn(async () => {
        const response = new Response(bytes)
        responses.push(response)
        return response
    })
    global.fetch = transport
    const stores = require("../src/ts/stores")
    stores.alwaysAllTime.value = allTime
    const { patchFetch } = require("../src/ts/root")
    patchFetch()
    const request = new GraphsRequest({ search: 'deck:"Test"', days })
    const response = await fetch("/_anki/graphs", {
        method: "POST",
        body: new Uint8Array(request.toBinary()),
    })
    // The original caller must still be able to consume its response body.
    expect(response).toBe(responses[0])
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
    await new Promise((resolve) => setImmediate(resolve))
    expect(transport).toHaveBeenCalledTimes(count)
    const requests = (transport.mock.calls as unknown as [string, RequestInit][]).map(([, init]) =>
        GraphsRequest.fromBinary(init.body as Uint8Array)
    )
    expect(requests[0]).toEqual(request)
    expect(requests[count - 1].search).toBe('(deck:"Test") (-is:suspended)')
    expect(requests[count - 1].days).toBe(allTime ? 0 : days)
    if (count === 3) {
        expect(requests[1].search).toBe(request.search)
        expect(requests[1].days).toBe(0)
    }
    expect(stores.data.set).toHaveBeenCalledTimes(2)
    expect(stores.data.set.mock.calls[0][0]).toBeNull()
    expect(stores.data.set.mock.calls[1][0].toBinary()).toEqual(bytes)
    expect(stores.not_suspended_data.set).toHaveBeenCalledTimes(1)
    expect(stores.cids.set).toHaveBeenLastCalledWith([123])
})

test("full collection skips card search and clears the selection on every refresh", async () => {
    jest.resetModules()
    global.fetch = jest.fn(
        async () => new Response(new Uint8Array(new GraphsResponse().toBinary()))
    )
    const stores = require("../src/ts/stores")
    const { search } = require("../src/ts/search")
    require("../src/ts/root").patchFetch()
    for (let i = 0; i < 2; i++) {
        await fetch("/_anki/graphs", { body: new Uint8Array(new GraphsRequest().toBinary()) })
    }
    await new Promise((resolve) => setImmediate(resolve))
    expect(search).not.toHaveBeenCalled()
    expect(stores.cids.set.mock.calls).toEqual([[null], [{ all: true }], [null], [{ all: true }]])
})

test("a pending filtered search cannot replace a newer full collection selection", async () => {
    jest.resetModules()
    global.fetch = jest.fn(
        async () => new Response(new Uint8Array(new GraphsResponse().toBinary()))
    )
    const stores = require("../src/ts/stores")
    const { search } = require("../src/ts/search")
    let finishSearch: (ids: number[]) => void
    search.mockReturnValue(
        new Promise<number[]>((resolve) => {
            finishSearch = resolve
        })
    )
    require("../src/ts/root").patchFetch()
    await fetch("/_anki/graphs", {
        body: new Uint8Array(new GraphsRequest({ search: "is:review" }).toBinary()),
    })
    await fetch("/_anki/graphs", { body: new Uint8Array(new GraphsRequest().toBinary()) })
    finishSearch!([123])
    await new Promise((resolve) => setImmediate(resolve))
    expect(stores.cids.set.mock.calls).toEqual([[null], [null], [{ all: true }]])
})

test("unrelated requests pass through without cloning or extra requests", async () => {
    jest.resetModules()
    const response = new Response("ok")
    const clone = jest.spyOn(response, "clone")
    const transport = jest.fn().mockResolvedValue(response)
    global.fetch = transport
    require("../src/ts/root").patchFetch()
    const options = { method: "POST", body: "payload" }
    expect(await fetch("/_anki/other", options)).toBe(response)
    expect(await response.text()).toBe("ok")
    expect(transport).toHaveBeenCalledTimes(1)
    expect(transport).toHaveBeenCalledWith("/_anki/other", options)
    expect(clone).not.toHaveBeenCalled()
})
