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
const src_1 = require("../src");
const chai_1 = require("chai");
const helpers = __importStar(require("./testing/helpers"));
helpers.setupEnv();
const config = {
    apiKey: 'AIzaSyDuimhtnMcV1zeTl4m1MphOgWnzS17QhBM',
    authDomain: 'abstracted-admin.firebaseapp.com',
    databaseURL: 'https://abstracted-admin.firebaseio.com',
    projectId: 'abstracted-admin',
    storageBucket: 'abstracted-admin.appspot.com',
    messagingSenderId: '547394508788'
};
const animalMocker = (h) => () => ({
    type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
    name: h.faker.name.firstName(),
    age: h.faker.random.number({ min: 1, max: 15 })
});
describe('Mocking', () => {
    let mockDb;
    beforeEach(async () => {
        mockDb = new src_1.RealTimeClient({ mocking: true });
        await mockDb.connect();
    });
    it('ref() returns a mock reference', () => {
        chai_1.expect(mockDb.ref('foo')).to.have.property('once');
    });
    it('getSnapshot() returns a mock snapshot', async () => {
        addAnimals(mockDb, 10);
        const animals = await mockDb.getSnapshot('/animals');
        chai_1.expect(animals.numChildren()).to.equal(10);
        mockDb.mock.queueSchema('animal', 5).generate();
        const moreAnimals = await mockDb.getSnapshot('/animals');
        chai_1.expect(moreAnimals.numChildren()).to.equal(15);
    });
    it('getValue() returns a value from mock DB', async () => {
        addAnimals(mockDb, 10);
        const animals = await mockDb.getValue('/animals');
        chai_1.expect(animals).to.be.an('object');
        chai_1.expect(helpers.length(animals)).to.equal(10);
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('id');
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('name');
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('age');
    });
    it('getRecord() returns a record from mock DB', async () => {
        addAnimals(mockDb, 10);
        const firstKey = helpers.firstKey(mockDb.mock.db.animals);
        const animal = await mockDb.getRecord(`/animals/${firstKey}`);
        chai_1.expect(animal).to.be.an('object');
        chai_1.expect(animal.id).to.equal(firstKey);
        chai_1.expect(animal).to.have.property('name');
        chai_1.expect(animal).to.have.property('age');
    });
    it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
        addAnimals(mockDb, 10);
        const firstKey = helpers.firstKey(mockDb.mock.db.animals);
        const animal = await mockDb.getRecord(`/animals/${firstKey}`, 'key');
        chai_1.expect(animal).to.be.an('object');
        chai_1.expect(animal).to.have.property('key');
        chai_1.expect(animal).to.have.property('name');
        chai_1.expect(animal).to.have.property('age');
    });
    it('getList() returns an array of records', async () => {
        addAnimals(mockDb, 10);
        const animals = await mockDb.getList('/animals');
        chai_1.expect(animals).to.be.an('array');
        chai_1.expect(animals).has.lengthOf(10);
        chai_1.expect(animals[0]).to.have.property('id');
        chai_1.expect(animals[0]).to.have.property('name');
        chai_1.expect(animals[0]).to.have.property('age');
    });
    it('getList() returns an array of records, with bespoke "id" property', async () => {
        addAnimals(mockDb, 10);
        const animals = await mockDb.getList('/animals', 'key');
        chai_1.expect(animals).to.be.an('array');
        chai_1.expect(animals).has.lengthOf(10);
        chai_1.expect(animals[0]).to.have.property('key');
        chai_1.expect(animals[0]).to.have.property('name');
        chai_1.expect(animals[0]).to.have.property('age');
    });
    it('set() sets to the mock DB', async () => {
        mockDb.set('/people/abcd', {
            name: 'Frank Black',
            age: 45
        });
        const people = await mockDb.getRecord('/people/abcd');
        chai_1.expect(people).to.have.property('id');
        chai_1.expect(people).to.have.property('name');
        chai_1.expect(people).to.have.property('age');
    });
    it('update() updates the mock DB', async () => {
        mockDb.mock.updateDB({
            people: {
                abcd: {
                    name: 'Frank Black',
                    age: 45
                }
            }
        });
        mockDb.update('/people/abcd', { age: 14 });
        const people = await mockDb.getRecord('/people/abcd');
        chai_1.expect(people).to.be.an('object');
        chai_1.expect(people).to.have.property('id');
        chai_1.expect(people).to.have.property('name');
        chai_1.expect(people).to.have.property('age');
        chai_1.expect(people.name).to.equal('Frank Black');
        chai_1.expect(people.age).to.equal(14);
    });
    it('push() pushes records into the mock DB', async () => {
        mockDb.push('/people', {
            name: 'Frank Black',
            age: 45
        });
        const people = await mockDb.getList('/people');
        chai_1.expect(people).to.be.an('array');
        chai_1.expect(people).has.lengthOf(1);
        chai_1.expect(helpers.firstRecord(people)).to.have.property('id');
        chai_1.expect(helpers.firstRecord(people)).to.have.property('name');
        chai_1.expect(helpers.firstRecord(people)).to.have.property('age');
        chai_1.expect(helpers.firstRecord(people).age).to.equal(45);
    });
    it('read operations on mock with a schema prefix are offset correctly', async () => {
        mockDb.mock
            .addSchema('meal', (h) => () => ({
            name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
            datetime: h.faker.date.recent()
        }))
            .pathPrefix('authenticated');
        mockDb.mock.queueSchema('meal', 10);
        mockDb.mock.generate();
        chai_1.expect(mockDb.mock.db.authenticated).to.be.an('object');
        chai_1.expect(mockDb.mock.db.authenticated.meals).to.be.an('object');
        const list = await mockDb.getList('/authenticated/meals');
        chai_1.expect(list.length).to.equal(10);
    });
    it('setting initial DB state works', async () => {
        const db2 = new src_1.RealTimeClient({
            mocking: true,
            mockData: {
                foo: 'bar'
            }
        });
        await db2.connect();
        chai_1.expect(db2.mock.db.foo).to.equal('bar');
    });
    it('setting auth() to accept anonymous works', async () => {
        const db3 = await src_1.RealTimeClient.connect({
            mocking: true,
            mockAuth: {
                providers: ['anonymous']
            }
        });
        const auth = await db3.auth();
        const user = await auth.signInAnonymously();
        chai_1.expect(user.user.uid).to.be.a('string');
    });
});
function addAnimals(db, count) {
    db.mock.addSchema('animal', animalMocker);
    db.mock.queueSchema('animal', count);
    db.mock.generate();
}
//# sourceMappingURL=mocking-spec.js.map