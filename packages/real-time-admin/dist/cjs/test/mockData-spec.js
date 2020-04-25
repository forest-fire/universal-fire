"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe("mockData", () => {
    it("mockData option initializes a mock database state", async () => {
        const db = await src_1.DB.connect({
            mocking: true,
            mockData: {
                people: {
                    1234: {
                        name: "Foobar"
                    }
                }
            }
        });
    });
});
//# sourceMappingURL=mockData-spec.js.map