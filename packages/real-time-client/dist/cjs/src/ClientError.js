"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@forest-fire/utility");
class ClientError extends utility_1.FireError {
    constructor(message, classification = 'RealTimeClient/unknown', statusCode = 400) {
        super(message, classification, 400);
        this.kind = 'RealTimeClient';
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=ClientError.js.map