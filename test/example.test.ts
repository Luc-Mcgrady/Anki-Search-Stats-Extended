import { defaultGraphBounds } from "../src/ts/graph"

const a = defaultGraphBounds()

test("Example test", () =>{
    expect(a.height).toBe(250)
})