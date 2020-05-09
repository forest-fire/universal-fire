"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstracted_database_1 = require("@forest-fire/abstracted-database");
const utility_1 = require("@forest-fire/utility");
class FirestoreDb extends abstracted_database_1.AbstractedDatabase {
    get database() {
        if (this._database) {
            return this._database;
        }
        throw new utility_1.FireError('Attempt to use Firestore without having instantiated it', 'not-ready');
    }
    set database(value) {
        this._database = value;
    }
    _isCollection(path) {
        path = typeof path !== 'string' ? path.path : path;
        return path.split('/').length % 2 === 0;
    }
    _isDocument(path) {
        return this._isCollection(path) === false;
    }
    get mock() {
        throw new Error('Not implemented');
    }
    async getList(path, idProp) {
        path = typeof path !== 'string' ? path.path : path;
        const querySnapshot = await this.database.collection(path).get();
        // @ts-ignore
        return querySnapshot.docs.map((doc) => {
            return {
                [idProp]: doc.id,
                ...doc.data(),
            };
        });
    }
    async getPushKey(path) {
        return this.database.collection(path).doc().id;
    }
    async getRecord(path, idProp = 'idProp') {
        const documentSnapshot = await this.database.doc(path).get();
        return {
            ...documentSnapshot.data(),
            [idProp]: documentSnapshot.id,
        };
    }
    async getValue(path) {
        throw new Error('Not implemented');
    }
    async update(path, value) {
        await this.database.doc(path).update(value);
    }
    async set(path, value) {
        await this.database.doc(path).set({ ...value });
    }
    async remove(path) {
        const pathIsCollection = this._isCollection(path);
        if (pathIsCollection) {
            this._removeCollection(path);
        }
        else {
            this._removeDocument(path);
        }
    }
    watch(target, events, cb) {
        throw new Error('Not implemented');
    }
    unWatch(events, cb) {
        throw new Error('Not implemented');
    }
    ref(path = '/') {
        throw new Error('Not implemented');
    }
    async _removeDocument(path) {
        await this.database.doc(path).delete();
    }
    async _removeCollection(path) {
        const batch = this.database.batch();
        // @ts-ignore
        this.database.collection(path).onSnapshot((snapshot) => {
            // @ts-ignore
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
        });
        // All or nothing.
        await batch.commit();
    }
}
exports.FirestoreDb = FirestoreDb;
//# sourceMappingURL=FirestoreDb.js.map