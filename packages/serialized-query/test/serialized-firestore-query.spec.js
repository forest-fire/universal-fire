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
const chai_1 = require("chai");
const helpers = __importStar(require("./testing/helpers"));
const SerializedFirestoreQuery_1 = require("../src/SerializedFirestoreQuery");
helpers.setupEnv();
describe('SerializedFirestoreQuery', () => {
    it('should be defined', () => {
        chai_1.expect(SerializedFirestoreQuery_1.SerializedFirestoreQuery).to.exist;
    });
    it('instantiates', () => {
        const q = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('foo');
        chai_1.expect(q).to.be.an.instanceOf(SerializedFirestoreQuery_1.SerializedFirestoreQuery);
    });
    it('instantiate with path()', () => {
        const q = SerializedFirestoreQuery_1.SerializedFirestoreQuery.path('foo');
        chai_1.expect(q).to.be.an.instanceOf(SerializedFirestoreQuery_1.SerializedFirestoreQuery);
    });
    it('instantiate without path, path set later', () => {
        const q = new SerializedFirestoreQuery_1.SerializedFirestoreQuery();
        chai_1.expect(q.path).to.equal('/');
        q.setPath('/foobar');
        chai_1.expect(q.path).to.equal('/foobar');
    });
    it('same query structure gives same hashCode', async () => {
        const foo = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
        const bar = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo.hashCode()).to.equal(bar.hashCode());
        const foo2 = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar2')
            .orderByChild('goober')
            .limitToFirst(5);
        const bar2 = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar2')
            .orderByChild('goober')
            .limitToFirst(5);
        chai_1.expect(foo2.hashCode()).to.equal(bar2.hashCode());
    });
    it('different query structure gives different hashCode', async () => {
        const foo2 = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar')
            .orderByChild('goober')
            .limitToFirst(5);
        const bar2 = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
    });
    it('identity property provides appropriate details', () => {
        const foo = new SerializedFirestoreQuery_1.SerializedFirestoreQuery('/foo/bar').orderByChild('goober');
        chai_1.expect(foo.identity).to.be.an('object');
        chai_1.expect(foo.identity.orderBy).to.equal('orderByChild');
        chai_1.expect(foo.identity.orderByKey).to.equal('goober');
        chai_1.expect(foo.identity.limitToFirst).to.equal(undefined);
        chai_1.expect(foo.identity.startAt).to.equal(undefined);
    });
});
//# sourceMappingURL=serialized-firestore-query.spec.js.map