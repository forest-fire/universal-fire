"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Gets the  */
function getRunningFirebaseApp(name, apps) {
    return name
        ? apps.find(i => i && i.name === name)
        : undefined;
}
exports.getRunningFirebaseApp = getRunningFirebaseApp;
//# sourceMappingURL=getRunningFirebaseApp.js.map