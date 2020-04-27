"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const RealTimeAdmin_1 = require("../src/RealTimeAdmin");
const chai = __importStar(require("chai"));
const expect = chai.expect;
describe('CRUD Testing > ', () => {
    let db;
    beforeEach(async () => {
        db = new RealTimeAdmin_1.RealTimeAdmin({ mocking: true });
        await db.connect();
    });
    describe('Multi-path operations', () => {
        it('Adding unprefixed paths is reflected in paths getter', async () => {
            await db.multiPathSet({
                foofoo: 'foo',
                foobar: 'bar',
                foobaz: 'baz'
            });
            console.log(db.mock.db);
            expect(Object.keys(db.mock.db).length).to.equal(3);
            expect(Object.keys(db.mock.db)).contains('foofoo');
            expect(Object.keys(db.mock.db)).contains('foobar');
            expect(Object.keys(db.mock.db)).contains('foobaz');
        });
        it('sets value at all paths using mock DB', async () => {
            const updates = {
                '/foofoo': 1,
                '/foobar': 2,
                '/foo/bar': 25
            };
            await db.multiPathSet(updates);
            console.log(db.mock.db);
            const foofoo = await db.getValue('/foofoo');
            const foobar = await db.getValue('/foobar');
            const foobar2 = await db.getValue('/foo/bar');
            expect(foofoo).to.equal(1);
            expect(foobar).to.equal(2);
            expect(foobar2).to.equal(25);
        });
    });
});
//# sourceMappingURL=multi-path-spec.js.map