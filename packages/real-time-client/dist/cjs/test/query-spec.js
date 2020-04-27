"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const chai_1 = require("chai");
const serialized_query_1 = require("serialized-query");
const helpers = __importStar(require("./testing/helpers"));
describe('Query based Read ops:', () => {
    helpers.setupEnv();
    let db;
    const personMockGenerator = (h) => () => ({
        name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
        age: h.faker.random.number({ min: 10, max: 99 })
    });
    beforeEach(async () => {
        db = await src_1.RealTimeClient.connect({ mocking: true });
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
        chai_1.expect(data.numChildren()).to.equal(33); // baseline check
        const q = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToFirst(5);
        data = await db.getSnapshot(q);
        chai_1.expect(data.numChildren()).to.equal(5);
        // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
        chai_1.expect(helpers.firstRecord(data.val()).age).to.equal(100);
        chai_1.expect(helpers.lastRecord(data.val()).age).to.equal(100);
        const q2 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToLast(5);
        data = await db.getSnapshot(q2);
        chai_1.expect(data.numChildren()).to.equal(5);
        chai_1.expect(helpers.firstRecord(data.val()).age).to.equal(1);
        chai_1.expect(helpers.lastRecord(data.val()).age).to.equal(1);
        const q3 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .equalTo(3);
        data = await db.getSnapshot(q3);
        chai_1.expect(data.numChildren()).to.equal(3);
        chai_1.expect(helpers.firstRecord(data.val()).age).to.equal(3);
        chai_1.expect(helpers.lastRecord(data.val()).age).to.equal(3);
    });
    it('getList() works with query passed in', async () => {
        let data = await db.getList('people');
        chai_1.expect(data.length).to.equal(33); // baseline check
        const q = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToFirst(5);
        data = await db.getList(q);
        chai_1.expect(data.length).to.equal(5);
        data.map(d => d.age).map(age => chai_1.expect(age).to.equal(100));
        const q2 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .limitToLast(5);
        data = await db.getList(q2);
        chai_1.expect(data.length).to.equal(5);
        data.map(d => d.age).map(age => chai_1.expect(age).to.equal(1));
        const q3 = serialized_query_1.SerializedQuery.path('people')
            .orderByChild('age')
            .equalTo(3);
        data = await db.getList(q3);
        chai_1.expect(data.length).to.equal(3);
        data.map(d => d.age).map(age => chai_1.expect(age).to.equal(3));
    });
    it('getList() with limit query on orderByKey of scalar values', async () => {
        db.mock.updateDB({
            ages: {
                asdfasdfas: 13,
                dfddffdfd: 5,
                adsffdffdfd: 26,
                ddfdfdfd: 1,
                werqerqer: 2,
                erwrewrw: 100
            }
        });
        const query = serialized_query_1.SerializedQuery.path('ages')
            .orderByKey()
            .limitToFirst(3);
        const ages = await db.getList(query);
        chai_1.expect(ages).to.have.lengthOf(3);
    });
    it('getList() with limit query on orderByValue', async () => {
        db.mock.updateDB({
            ages: {
                asdfasdfas: 13,
                dfddffdfd: 5,
                adsffdffdfd: 26,
                ddfdfdfd: 1,
                werqerqer: 2,
                erwrewrw: 100
            }
        });
        const query = serialized_query_1.SerializedQuery.path('ages')
            .orderByValue()
            .limitToFirst(3);
        const ages = await db.getList(query);
        chai_1.expect(ages).to.have.lengthOf(3);
    });
});
//# sourceMappingURL=query-spec.js.map