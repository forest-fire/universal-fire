"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../shared");
/**
 * Extracts the client configuration from ENV variables and processes it
 * through either BASE64 or JSON decoding.
 */
function extractClientConfig() {
    return shared_1.extractEncodedString(process.env.FIREBASE_CONFIG);
}
exports.extractClientConfig = extractClientConfig;
//# sourceMappingURL=extractClientConfig.js.map