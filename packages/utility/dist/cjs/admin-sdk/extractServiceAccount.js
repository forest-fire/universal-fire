"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
/**
 * Takes as input a variety of possible formats and converts it into
 * a Firebase service account (`IServiceAccount`). The input formats
 * which it accepts are:
 *
 * - an `IServiceAccount` object (_in which case nothing to be done_)
 * - a JSON encoded string of the `IServiceAccount` object
 * - a base64 encoded string of a `IServiceAccount` object (_possible but not recommended
 * as an ENV variable may run out of room to encode_)
 * - a base64 encoded GZIP of a `IServiceAccount` object (_this is ideal for ENV vars
 * which have limited length and must be string_)
 */
function extractServiceAccount(config) {
    const serviceAccount = config.serviceAccount || process.env['FIREBASE_SERVICE_ACCOUNT'];
    if (!serviceAccount) {
        throw new index_1.FireError(`There was no service account defined!`, 'invalid-configuration');
    }
    switch (typeof serviceAccount) {
        case 'object':
            if (serviceAccount.privateKey && serviceAccount.projectId) {
                return serviceAccount;
            }
            else {
                throw new index_1.FireError(`An attempt to use the Admin SDK failed because a service account object was passed in but it did NOT have the required properties of "privateKey" and "projectId".`, 'invalid-configuration');
            }
        case 'string':
            // JSON
            if (index_1.looksLikeJson(serviceAccount)) {
                try {
                    const data = JSON.parse(serviceAccount);
                    if (data.private_key && data.type === 'service_account') {
                        return data;
                    }
                    else {
                        throw new index_1.FireError(`The configuration appeared to contain a JSON encoded representation of the service account but after decoding it the private_key and/or the type property were not correctly set.`, 'invalid-configuration');
                    }
                }
                catch (e) {
                    throw new index_1.FireError(`The configuration appeared to contain a JSOn encoded representation but was unable to be parsed: ${e.message}`, 'invalid-configuration');
                }
            }
            // BASE 64
            try {
                const buffer = Buffer.from(serviceAccount, 'base64');
                return JSON.parse(buffer.toString());
            }
            catch (e) {
                throw new index_1.FireError(`Failed to convert a string based service account to IServiceAccount! The error was: ${e.message}`, 'invalid-configuration');
            }
    }
}
exports.extractServiceAccount = extractServiceAccount;
//# sourceMappingURL=extractServiceAccount.js.map