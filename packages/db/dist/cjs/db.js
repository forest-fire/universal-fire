"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DB {
    /**
     * A static initializer which can hand back any of the supported SDK's for either
     * Firestore or Real-Time Database.
     *
     * @param constructor The DB/SDK class which you wish to use
     * @param config The database configuration
     */
    static async connect(constructor, config) {
        const db = new constructor(config);
        await db.connect();
        return db;
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map