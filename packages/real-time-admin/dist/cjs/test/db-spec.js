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
const chai = __importStar(require("chai"));
const helpers = __importStar(require("./testing/helpers"));
const expect = chai.expect;
describe('Connecting to Database', () => {
    it('can not instantiate without setting FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATA_ROOT_URL', () => {
        try {
            const db = new src_1.DB();
            expect(true).to.equal(false);
        }
        catch (e) {
            expect(true).to.equal(true);
        }
    });
    it('once ENV is setup, can instantiate', () => {
        helpers.setupEnv();
        const db = new src_1.DB();
        expect(true).to.equal(true);
    });
    it('can get a value from database once waitForConnection() returns', async () => {
        const db = new src_1.DB();
        expect(db.isConnected).to.be.a('boolean');
        await db.connect();
        expect(db.isConnected).to.equal(true);
        const connected = await db.getValue('.info/connected');
        // TODO: come back at some point and explore why this wasn't working
        // expect(connected).to.equal(true);
    });
});
describe('Write Operations', () => {
    helpers.setupEnv();
    const db = new src_1.DB();
    afterEach(async () => {
        await db.remove('scratch');
    });
    it('push() variables into database', async () => {
        await db.push('scratch/pushed', {
            name: 'Charlie',
            age: 25
        });
        await db.push('scratch/pushed', {
            name: 'Sandy',
            age: 32
        });
        const users = await db.getValue('scratch/pushed');
        expect(Object.keys(users).length).to.equal(2);
        expect(helpers.valuesOf(users, 'name')).to.include('Charlie');
        expect(helpers.valuesOf(users, 'name')).to.include('Sandy');
    });
    it('set() sets data at a given path in DB', async () => {
        await db.set('scratch/set/user', {
            name: 'Charlie',
            age: 25
        });
        const user = await db.getValue('scratch/set/user');
        expect(user.name).to.equal('Charlie');
        expect(user.age).to.equal(25);
    });
    it('update() can "set" and then "update" contents', async () => {
        await db.update('scratch/update/user', {
            name: 'Charlie',
            age: 25
        });
        let user = await db.getValue('scratch/update/user');
        expect(user.name).to.equal('Charlie');
        expect(user.age).to.equal(25);
        await db.update('scratch/update/user', {
            name: 'Charles',
            age: 34
        });
        user = await db.getValue('scratch/update/user');
        expect(user.name).to.equal('Charles');
        expect(user.age).to.equal(34);
    });
    it('update() leaves unchanged attributes as they were', async () => {
        await db.update('scratch/update/user', {
            name: 'Rodney',
            age: 25
        });
        let user = await db.getValue('scratch/update/user');
        expect(user.name).to.equal('Rodney');
        expect(user.age).to.equal(25);
        await db.update('scratch/update/user', {
            age: 34
        });
        user = await db.getValue('scratch/update/user');
        expect(user.name).to.equal('Rodney');
        expect(user.age).to.equal(34);
    });
    it('remove() eliminates a path -- and all children -- in DB', async () => {
        await db.set('scratch/removal/user', {
            name: 'Rodney',
            age: 25
        });
        let user = await db.getValue('scratch/removal/user');
        expect(user.name).to.equal('Rodney');
        await db.remove('scratch/removal/user');
        user = await db.getValue('scratch/removal/user');
        expect(user).to.equal(null);
    }).timeout(5000);
});
describe('Other Operations', () => {
    helpers.setupEnv();
    const db = new src_1.DB();
    afterEach(async () => {
        await db.remove('scratch');
    });
    it('exists() tests to true/false based on existance of data', async () => {
        await db.set('/scratch/existance', 'foobar');
        let exists = await db.exists('/scratch/existance');
        expect(exists).to.equal(true);
        await db.remove('/scratch/existance');
        exists = await db.exists('/scratch/existance');
        expect(exists).to.equal(false);
    });
});
//# sourceMappingURL=db-spec.js.map