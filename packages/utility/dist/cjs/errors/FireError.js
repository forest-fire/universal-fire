"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FireError extends Error {
    constructor(message, classification = 'UniversalFire/error', statusCode = 400) {
        super(message);
        this.universalFire = true;
        this.kind = 'FireError';
        const parts = classification.split('/');
        const klass = this.constructor.name;
        this.name = parts.length === 2 ? classification : `${klass}/${parts[0]}`;
        this.code = parts.length === 2 ? parts[1] : parts[0];
        this.statusCode = statusCode;
    }
}
exports.FireError = FireError;
//# sourceMappingURL=FireError.js.map