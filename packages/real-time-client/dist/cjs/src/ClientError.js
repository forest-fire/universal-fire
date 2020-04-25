"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientError extends Error {
    constructor(message, classification = "abstracted-client/unknown") {
        super(message);
        this.kind = "ClientError";
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["abstracted-client", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=ClientError.js.map