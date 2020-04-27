"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-implicit-dependencies
const chai = __importStar(require("chai"));
const index_1 = require("../src/index");
const serialized_query_1 = require("serialized-query");
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
describe('Query based Read ops:', async () => {
    helpers.setupEnv();
    let db;
    before(async () => {
        db = await index_1.RealTimeAdmin.connect({ mocking: true });
        const personMockGenerator = h => () => {
            console.log('CONTEXT', h);
            return {
                name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
                age: h.faker.random.number({ min: 10, max: 99 })
            };
        };
        db.mock.addSchema('person', personMockGenerator);
        db.mock.queueSchema('person', 20);
        db.mock.queueSchema('person', 5, { age: 100 });
        db.mock.queueSchema('person', 5, { age: 1 });
        db.mock.queueSchema('person', 3, { age: 3 });
        db.mock.generate();
        if (!process.env.MOCK) {
            await db.set('people', db.mock.db);
        }
    });
    it('getSnapshot() works with query passed in', async () => {
        let data = await db.getSnapshot('people');
        expect(data.numChildren()).to.equal(33); // baseline check
        const q = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToFirst(5);
        data = await db.getSnapshot(q);
        expect(data.numChildren()).to.equal(5);
        // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
        expect(helpers.firstRecord(data.val()).age).to.equal(100);
        expect(helpers.lastRecord(data.val()).age).to.equal(100);
        const q2 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToLast(5);
        data = await db.getSnapshot(q2);
        expect(data.numChildren()).to.equal(5);
        expect(helpers.firstRecord(data.val()).age).to.equal(1);
        expect(helpers.lastRecord(data.val()).age).to.equal(1);
        const q3 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .equalTo(3);
        data = await db.getSnapshot(q3);
        expect(data.numChildren()).to.equal(3);
        expect(helpers.firstRecord(data.val()).age).to.equal(3);
        expect(helpers.lastRecord(data.val()).age).to.equal(3);
    });
    it('getList() works with query passed in', async () => {
        let data = await db.getList('people');
        expect(data.length).to.equal(33); // baseline check
        const q = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToFirst(5);
        data = await db.getList(q);
        expect(data.length).to.equal(5);
        data.map((d) => d.age).map((age) => expect(age).to.equal(100));
        const q2 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToLast(5);
        data = await db.getList(q2);
        expect(data.length).to.equal(5);
        data.map((d) => d.age).map((age) => expect(age).to.equal(1));
        const q3 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .equalTo(3);
        data = await db.getList(q3);
        expect(data.length).to.equal(3);
        data.map((d) => d.age).map((age) => expect(age).to.equal(3));
        // test serialized query can be built with DB's exposed API
        const qPrime = db
            .query('people')
            .orderByChild('age')
            .limitToFirst(4);
        data = await db.getList(qPrime);
        expect(data).to.have.lengthOf(4);
        data.map((d) => d.age).map((age) => expect(age).to.equal(100));
    });
    /**
     * hashLookups have a meaningful value as the value prop;
     * this is in contrast to the "hashArray" where the value
     * is set to TRUE only
     */
    it('getList() works with a hashLookup list', async () => {
        db.mock.updateDB({
            hash: {
                '-LFsnvrP4aDu3wcbxfVk': 1529961496026,
                '-LFsnvrvoavTDlWzdoPL': 1529961496059,
                '-LFsnvsq2FDo48xxRzmO': 1529961496118,
                '-LFsnvswzAKs8hgu6B7R': 1529961496124,
                '-LFsnvt2hq28zZHeddyn': 1529961496131
            }
        });
        const list = await db.getList('hash');
        expect(list).to.have.lengthOf(5);
        expect(list[0]).to.be.an('object');
    });
    it('getList() brings back a simple array when presented with a hashArray', async () => {
        db.mock.updateDB({
            hash: {
                '-LFsnvrP4aDu3wcbxfVk': true,
                '-LFsnvrvoavTDlWzdoPL': true,
                '-LFsnvsq2FDo48xxRzmO': true,
                '-LFsnvswzAKs8hgu6B7R': true,
                '-LFsnvt2hq28zZHeddyn': true
            }
        });
        const list = await db.getList('hash');
        expect(list).to.have.length(5);
        expect(list[0]).to.be.a('string');
    });
});
//# sourceMappingURL=query-spec.js.map