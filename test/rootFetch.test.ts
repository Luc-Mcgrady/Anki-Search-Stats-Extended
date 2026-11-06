import { GraphsRequest, GraphsResponse } from "../src/ts/proto/anki/stats_pb"

jest.mock("svelte/store", () => ({ get: (store: { value: boolean }) => store.value }))
jest.mock("../src/ts/stores", () => ({
    alwaysAllTime: { value: false },
    cids: { set: jest.fn() },
    data: { set: jest.fn() },
    graphsRequest: { set: jest.fn() },
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
    const response = await fetch("/_anki/graphs", { method: "POST", body: new Uint8Array(request.toBinary()) })
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
