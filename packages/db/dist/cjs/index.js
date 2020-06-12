'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./proxy-symbols"), exports);
var real_time_client_1 = require("@forest-fire/real-time-client");
Object.defineProperty(exports, "RealTimeClient", { enumerable: true, get: function () { return real_time_client_1.RealTimeClient; } });
var firestore_client_1 = require("@forest-fire/firestore-client");
Object.defineProperty(exports, "FirestoreClient", { enumerable: true, get: function () { return firestore_client_1.FirestoreClient; } });
