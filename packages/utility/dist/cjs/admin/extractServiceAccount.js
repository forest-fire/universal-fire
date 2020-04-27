"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const is_gzip_1 = __importDefault(require("is-gzip"));
const zlib_1 = require("zlib");
/**
 * Takes as input a variety of possible formats and converts it into
 * a Firebase service account (`IServiceAccount`). The input formats
 * which it accepts are:
 *
 * - an `IServiceAccount` object (_in which case nothing to be done_)
 * - a base64 encoded string of a `IServiceAccount` object (_possible but not recommended
 * as an ENV variable may run out of room to encode_)
 * - a base64 encoded GZIP of a `IServiceAccount` object (_this is ideal for ENV vars
 * which have limited length and must be string_)
 */
function extractServiceAccount(config) {
    const serviceAccount = config.serviceAccount || process.env['FIREBASE_SERVICE_ACCOUNT'];
    if (!serviceAccount) {
        throw new errors_1.FireError(`There was no service account defined!`, 'invalid-configuration');
    }
    switch (typeof serviceAccount) {
        case 'object':
            if (serviceAccount.privateKey && serviceAccount.projectId) {
                return serviceAccount;
            }
            else {
                throw new errors_1.FireError(`An attempt to use the Admin SDK failed because a service account object was passed in but it did NOT have the required properties of "privateKey" and "projectId".`, 'invalid-configuration');
            }
        case 'string':
            try {
                const buffer = base64Buffer(serviceAccount);
                return is_gzip_1.default(buffer)
                    ? JSON.parse(unzip(buffer))
                    : JSON.parse(buffer.toString());
            }
            catch (e) {
                throw new errors_1.FireError(`Failed to convert a string based service account to IServiceAccount! The error was: ${e.message}`, 'invalid-configuration');
            }
    }
    return {};
}
exports.extractServiceAccount = extractServiceAccount;
function base64Buffer(data) {
    return Buffer.from(data, 'base64');
}
function unzip(data) {
    return zlib_1.gunzipSync(data).toString();
}
// const serviceAcctEncoded = process.env
//   .FIREBASE_SERVICE_ACCOUNT_COMPRESSED
//   ? (
//       await gunzipAsync(
//         Buffer.from(
//           config.serviceAccount ||
//             process.env['FIREBASE_SERVICE_ACCOUNT']
//         )
//       )
//     ).toString('utf-8')
//   : config.serviceAccount || process.env['FIREBASE_SERVICE_ACCOUNT'];
// if (!serviceAcctEncoded) {
//   throw new Error(
//     'Problem loading the credientials for Firebase admin API. Please ensure FIREBASE_SERVICE_ACCOUNT is set with base64 encoded version of Firebase private key or pass it in explicitly as part of the config object.'
//   );
// }
// if (
//   !config.serviceAccount &&
//   !process.env['FIREBASE_SERVICE_ACCOUNT']
// ) {
//   throw new Error(
//     `Service account was not defined in passed in configuration nor the FIREBASE_SERVICE_ACCOUNT environment variable.`
//   );
// }
// const serviceAccount: firebase.ServiceAccount = JSON.parse(
//   Buffer.from(
//     config.serviceAccount
//       ? config.serviceAccount
//       : process.env['FIREBASE_SERVICE_ACCOUNT'],
//     'base64'
//   ).toString()
// );
//# sourceMappingURL=extractServiceAccount.js.map