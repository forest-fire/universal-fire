"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAdmin = void 0;
const real_time_admin_1 = require("@forest-fire/real-time-admin");
async function RealTimeAdmin(config) {
    return real_time_admin_1.RealTimeAdmin.connect(config);
}
exports.RealTimeAdmin = RealTimeAdmin;
//# sourceMappingURL=RealTimeAdmin.js.map