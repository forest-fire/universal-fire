"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunningFirebaseApp = void 0;
const index_1 = require("../index");
/** Gets the  */
function getRunningFirebaseApp(name, apps) {
    const result = name ? apps.find(i => i && i.name === name) : undefined;
    if (!result) {
        throw new index_1.FireError(`Attempt to get the Firebase app named "${name}" failed`, 'invalid-app-name');
    }
    return result;
}
exports.getRunningFirebaseApp = getRunningFirebaseApp;
//# sourceMappingURL=getRunningFirebaseApp.js.map