"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientError = void 0;
const utility_1 = require("@forest-fire/utility");
const common_types_1 = require("common-types");
class ClientError extends utility_1.FireError {
    constructor(
    /** a human friendly error message */
    message, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    classification, 
    /**
     * A numeric HTTP status code; defaults to 400 if not stated
     */
    httpStatusCode = common_types_1.HttpStatusCodes.BadRequest) {
        super(message, classification.includes('/')
            ? classification
            : `RealTimeClient/${classification}`, httpStatusCode);
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=ClientError.js.map