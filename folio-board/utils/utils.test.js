import * as utils from "./index.js";

describe("utils.generateID", () => {
    it("should generate an ID string", () => {
        expect(typeof utils.generateID()).toBe("string");
    });
});
