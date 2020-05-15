"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const universal_fire_1 = require("universal-fire");
const chai_1 = require("chai");
const firemodel_1 = require("firemodel");
const typed_conversions_1 = require("typed-conversions");
const real_time_admin_1 = require("@forest-fire/real-time-admin");
const helpers = __importStar(require("./testing/helpers"));
const people_1 = require("./data/people");
const Person_1 = require("./testing/Person");
const SerializedRealTimeQuery_1 = require("../src/SerializedRealTimeQuery");
helpers.setupEnv();
describe('SerializedRealTimeQuery', () => {
    let mockDb;
    before(async () => {
        mockDb = await universal_fire_1.DB.connect(real_time_admin_1.RealTimeAdmin, { mocking: true });
        // TODO: remove the comment below when we update FireModel to use the new
        // DB abstraction.
        // @ts-ignore
        firemodel_1.FireModel.defaultDb = mockDb;
    });
    it('should be defined', () => {
        chai_1.expect(SerializedRealTimeQuery_1.SerializedRealTimeQuery).to.exist;
    });
    it('instantiates', () => {
        const q = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('foo');
        chai_1.expect(q).to.be.an.instanceOf(SerializedRealTimeQuery_1.SerializedRealTimeQuery);
    });
    it('instantiate with path()', () => {
        const q = SerializedRealTimeQuery_1.SerializedRealTimeQuery.path('foo');
        chai_1.expect(q).to.be.an.instanceOf(SerializedRealTimeQuery_1.SerializedRealTimeQuery);
    });
    it('instantiate without path, path set later', () => {
        const q = new SerializedRealTimeQuery_1.SerializedRealTimeQuery();
        chai_1.expect(q.path).to.equal('/');
        q.setPath('/foobar');
        chai_1.expect(q.path).to.equal('/foobar');
    });
    it('same query structure gives same hashCode', async () => {
        const foo = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
        const bar = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo.hashCode()).to.equal(bar.hashCode());
        const foo2 = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar2')
            .orderByChild('goober')
            .limitToFirst(5);
        const bar2 = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar2')
            .orderByChild('goober')
            .limitToFirst(5);
        chai_1.expect(foo2.hashCode()).to.equal(bar2.hashCode());
    });
    it('different query structure gives different hashCode', async () => {
        const foo2 = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar')
            .orderByChild('goober')
            .limitToFirst(5);
        const bar2 = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
    });
    it('identity property provides appropriate details', () => {
        const foo = new SerializedRealTimeQuery_1.SerializedRealTimeQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo.identity).to.be.an('object');
        chai_1.expect(foo.identity.orderBy).to.equal('orderByChild');
        chai_1.expect(foo.identity.orderByKey).to.equal('goober');
        chai_1.expect(foo.identity.limitToFirst).to.equal(undefined);
        chai_1.expect(foo.identity.startAt).to.equal(undefined);
    });
    it('equalTo() works when done manually', async () => {
        mockDb.mock.updateDB(people_1.peopleDataset());
        chai_1.expect(firemodel_1.List.dbPath(Person_1.Person)).to.equal('authenticated/people');
        const sq = new SerializedRealTimeQuery_1.SerializedRealTimeQuery(firemodel_1.List.dbPath(Person_1.Person)).orderByChild('age');
    });
    it('equalTo() query filters down to right results for static pathed model', async () => {
        mockDb.mock.updateDB(people_1.peopleDataset());
        const foo = new SerializedRealTimeQuery_1.SerializedRealTimeQuery()
            .orderByChild('age')
            .equalTo('green', 'favoriteColor');
        foo.setPath(firemodel_1.List.dbPath(Person_1.Person));
    });
});
describe('SerializedRealTimeQuery with REAL database', () => {
    let db;
    before(async () => {
        // TODO: remove the comment below when we update DB to allow no config
        // to be passed.
        // @ts-ignore
        db = await universal_fire_1.DB.connect(real_time_admin_1.RealTimeAdmin);
        // TODO: remove the comment below when we update FireModel to use the new
        // DB abstraction.
        // @ts-ignore
        firemodel_1.List.defaultDb = db;
        await db.set('/', people_1.peopleDataset());
    });
    after(async () => {
        await db.remove(`/authenticated/fancyPeople`, true);
        db.remove('/authenticated');
    });
    it('equalTo() deserializes into valid response', async () => {
        const q = new SerializedRealTimeQuery_1.SerializedRealTimeQuery(firemodel_1.List.dbPath(Person_1.Person))
            .orderByChild('favoriteColor')
            .equalTo('green');
        const deserializedQuery = q.deserialize(db);
        const manualQuery = db
            .ref('/authenticated/people')
            .orderByChild('favoriteColor')
            .equalTo('green');
        const manualJSON = typed_conversions_1.hashToArray((await manualQuery.once('value')).toJSON());
        const deserializedJSON = typed_conversions_1.hashToArray((await deserializedQuery.once('value')).toJSON());
        chai_1.expect(manualJSON.length).to.equal(deserializedJSON.length);
        chai_1.expect(deserializedJSON.length).to.be.greaterThan(0);
        deserializedJSON.forEach(i => chai_1.expect(i.favoriteColor).to.equal('green'));
    });
    it('limit query reduces result set', async () => {
        const q = new SerializedRealTimeQuery_1.SerializedRealTimeQuery(firemodel_1.List.dbPath(Person_1.Person))
            .orderByChild('age')
            .limitToFirst(2);
        const query = await q.execute(db);
        const deserializedJson = typed_conversions_1.hashToArray(query.toJSON());
        const sortedPeople = typed_conversions_1.hashToArray(people_1.peopleDataset().authenticated.people).sort((a, b) => (a.age > b.age ? 1 : -1));
        chai_1.expect(deserializedJson.length).to.equal(2);
        chai_1.expect(deserializedJson[0].age).to.equal(sortedPeople[0].age);
    });
});
//# sourceMappingURL=serialized-realtime-query.spec.js.map