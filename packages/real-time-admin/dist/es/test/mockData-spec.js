import { DB } from "../src";
describe("mockData", () => {
    it("mockData option initializes a mock database state", async () => {
        const db = await DB.connect({
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