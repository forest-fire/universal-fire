"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreAdmin = void 0;
const firestore_admin_1 = require("@forest-fire/firestore-admin");
async function FirestoreAdmin(config) {
    return firestore_admin_1.FirestoreAdmin.connect(config);
}
exports.FirestoreAdmin = FirestoreAdmin;
//# sourceMappingURL=FirestoreAdmin.js.map