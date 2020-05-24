"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = exports.auth = void 0;
const shared_1 = require("./shared");
const implemented_1 = require("./auth/client-sdk/implemented");
let hasConnectedToAuthService = false;
exports.auth = async () => {
    if (hasConnectedToAuthService) {
        return exports.authApi;
    }
    await shared_1.networkDelay();
    hasConnectedToAuthService = true;
    return exports.authApi;
};
// tslint:disable-next-line:no-object-literal-type-assertion
exports.authApi = {
    ...implemented_1.implemented,
};
//# sourceMappingURL=auth.js.map