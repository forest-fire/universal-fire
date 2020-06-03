"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDataUrl = void 0;
const types_1 = require("@forest-fire/types");
const index_1 = require("../index");
/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
function extractDataUrl(config) {
    if (types_1.isMockConfig(config)) {
        return 'https://mocking.com';
    }
    const dataUrl = config.databaseURL
        ? config.databaseURL
        : process.env['FIREBASE_DATABASE_URL'];
    if (!dataUrl) {
        throw new index_1.FireError(`There was no DATABASE URL provided! This needs to be passed in as part of the configuration or as the FIREBASE_DATABASE_URL environment variable.`, 'invalid-configuration');
    }
    return dataUrl;
}
exports.extractDataUrl = extractDataUrl;
//# sourceMappingURL=extractDataUrl.js.map