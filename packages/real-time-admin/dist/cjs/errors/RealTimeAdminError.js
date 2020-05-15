"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAdminError = void 0;
const utility_1 = require("@forest-fire/utility");
class RealTimeAdminError extends utility_1.FireError {
    constructor(message, classification = 'RealTimeAdmin/error', statusCode = 400) {
        super(message, classification, statusCode);
        this.kind = 'RealTimeAdminError';
    }
}
exports.RealTimeAdminError = RealTimeAdminError;
//# sourceMappingURL=RealTimeAdminError.js.map