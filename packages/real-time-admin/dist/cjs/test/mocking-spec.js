"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const chai_1 = require("chai");
const helpers = __importStar(require("./testing/helpers"));
helpers.setupEnv();
const animalMocker = h => () => ({
    type: h.faker.random.arrayElement(['cat', 'dog', 'parrot']),
    name: h.faker.name.firstName(),
    age: h.faker.random.number({ min: 1, max: 15 })
});
describe('Mocking', async () => {
    it('ref() returns a mock reference', async () => {
        const db = new index_1.RealTimeAdmin();
        await db.connect();
        chai_1.expect(db.ref('foo')).to.have.property('once');
        const mockDb = await index_1.RealTimeAdmin.connect({ mocking: true });
        await mockDb.connect();
        chai_1.expect(mockDb.ref('foo')).to.have.property('once');
    });
    it('getSnapshot() returns a mock snapshot', async () => {
        const db = await index_1.RealTimeAdmin.connect({ mocking: true });
        await db.connect();
        addAnimals(db, 10);
        const animals = await db.getSnapshot('/animals');
        chai_1.expect(animals.numChildren()).to.equal(10);
        db.mock.queueSchema('animal', 5).generate();
        const moreAnimals = await db.getSnapshot('/animals');
        chai_1.expect(moreAnimals.numChildren()).to.equal(15);
    });
    it('getValue() returns a value from mock DB', async () => {
        const db = await index_1.RealTimeAdmin.connect({ mocking: true });
        await db.connect();
        addAnimals(db, 10);
        const animals = await db.getValue('/animals');
        chai_1.expect(animals).to.be.an('object');
        chai_1.expect(helpers.length(animals)).to.equal(10);
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('id');
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('name');
        chai_1.expect(helpers.firstRecord(animals)).to.have.property('age');
    });
    it('getRecord() returns a record from mock DB', async () => {
        const db = await index_1.RealTimeAdmin.connect({ mocking: true });
        addAnimals(db, 10);
        const firstKey = helpers.firstKey(db.mock.db.animals);
        const animal = await db.getRecord(`/animals/${firstKey}`);
        chai_1.expect(animal).to.be.an('object');
        chai_1.expect(animal.id).to.equal(firstKey);
        chai_1.expect(animal).to.have.property('name');
        chai_1.expect(animal).to.have.property('age');
    });
    it('getRecord() returns a record from mock DB with bespoke id prop', async () => {
        const db = await index_1.RealTimeAdmin.connect({ mocking: true });
        addAnimals(db, 10);
        const firstKey = helpers.firstKey(db.mock.db.animals);
        const animal = await db.getRecord(`/animals/${firstKey}`, 'key');
        chai_1.expect(animal).to.be.an('object');
        chai_1.expect(animal).to.have.property('key');
        chai_1.expect(animal).to.have.property('name');
        chai_1.expect(animal).to.have.property('age');
    });
    it('getList() returns an array of records', async () => {
        const db = await index_1.RealTimeAdmin.connect({ mocking: true });
        addAnimals(db, 10);
        const animals = await db.getList('/animals');
        chai_1.expect(animals).to.be.an('array');
        chai_1.expect(animals).has.lengthOf(10);
        chai_1.expect(animals[0]).to.have.property('id');
        chai_1.expect(animals[0]).to.have.property('name');
        chai_1.expect(animals[0]).to.have.property('age');
    });
    it('getList() returns an array of records, with bespoke "id" property', async () => {
        const db = new index_1.RealTimeAdmin({ mocking: true });
        await db.connect();
        addAnimals(db, 10);
        const animals = await db.getList('/animals', 'key');
        chai_1.expect(animals).to.be.an('array');
        chai_1.expect(animals).has.lengthOf(10);
        chai_1.expect(animals[0]).to.have.property('key');
        chai_1.expect(animals[0]).to.have.property('name');
        chai_1.expect(animals[0]).to.have.property('age');
    });
    it('set() sets to the mock DB', async () => {
        const db = new index_1.RealTimeAdmin({ mocking: true });
        await db.connect();
        db.set('/people/abcd', {
            name: 'Frank Black',
            age: 45
        });
        const people = await db.getRecord('/people/abcd');
        chai_1.expect(people).to.have.property('id');
        chai_1.expect(people).to.have.property('name');
        chai_1.expect(people).to.have.property('age');
    });
    it('update() updates the mock DB', async () => {
        const db = new index_1.RealTimeAdmin({ mocking: true });
        await db.connect();
        db.mock.updateDB({
            people: {
                abcd: {
                    name: 'Frank Black',
                    age: 45
                }
            }
        });
        db.update('/people/abcd', { age: 14 });
        const people = await db.getRecord('/people/abcd');
        chai_1.expect(people).to.be.an('object');
        chai_1.expect(people).to.have.property('id');
        chai_1.expect(people).to.have.property('name');
        chai_1.expect(people).to.have.property('age');
        chai_1.expect(people.name).to.equal('Frank Black');
        chai_1.expect(people.age).to.equal(14);
    });
    it('push() pushes records into the mock DB', async () => {
        const db = new index_1.RealTimeAdmin({ mocking: true });
        await db.connect();
        db.push('/people', {
            name: 'Frank Black',
            age: 45
        });
        const people = await db.getList('/people');
        chai_1.expect(people).to.be.an('array');
        chai_1.expect(people).has.lengthOf(1);
        chai_1.expect(helpers.firstRecord(people)).to.have.property('id');
        chai_1.expect(helpers.firstRecord(people)).to.have.property('name');
        chai_1.expect(helpers.firstRecord(people)).to.have.property('age');
        chai_1.expect(helpers.firstRecord(people).age).to.equal(45);
    });
    it('read operations on mock with a schema prefix are offset correctly', async () => {
        const db = new index_1.RealTimeAdmin({ mocking: true });
        await db.connect();
        db.mock
            .addSchema('meal', h => () => ({
            name: h.faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
            datetime: h.faker.date.recent()
        }))
            .pathPrefix('authenticated');
        db.mock.queueSchema('meal', 10);
        db.mock.generate();
        chai_1.expect(db.mock.db.authenticated).to.be.an('object');
        chai_1.expect(db.mock.db.authenticated.meals).to.be.an('object');
        const list = await db.getList('/authenticated/meals');
        chai_1.expect(list.length).to.equal(10);
    });
});
function addAnimals(db, count) {
    db.mock.addSchema('animal', animalMocker);
    db.mock.queueSchema('animal', count);
    db.mock.generate();
}
//# sourceMappingURL=mocking-spec.js.map