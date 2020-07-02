"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./proxy-symbols"), exports);
__exportStar(require("./sdk-types"), exports);
var real_time_client_1 = require("@forest-fire/real-time-client");
Object.defineProperty(exports, "RealTimeClient", { enumerable: true, get: function () { return real_time_client_1.RealTimeClient; } });
var firestore_client_1 = require("@forest-fire/firestore-client");
Object.defineProperty(exports, "FirestoreClient", { enumerable: true, get: function () { return firestore_client_1.FirestoreClient; } });
//# sourceMappingURL=client.js.map