"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
function extractDataUrl(config) {
    const dataUrl = config.databaseUrl || process.env['FIREBASE_DATABASE_URL'];
    if (!dataUrl && !config.mocking) {
        throw new index_1.FireError(`There was no DATABASE URL provided! This needs to be passed in as part of the configuration or as the FIREBASE_DATABASE_URL environment variable. [${config.mocking}]`, 'invalid-configuration');
    }
    return config.mocking ? 'https://mock-database.dev.null' : dataUrl;
}
exports.extractDataUrl = extractDataUrl;
//# sourceMappingURL=extractDataUrl.js.map