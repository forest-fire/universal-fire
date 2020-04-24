"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
function slashNotation(path) {
    return path.substr(0, 5) === '.info'
        ? path.substr(0, 5) + path.substring(5).replace(/\./g, '/')
        : path.replace(/\./g, '/');
}
exports.slashNotation = slashNotation;
function _getFirebaseType(context, kind) {
    if (!context.isConnected) {
        throw new errors_1.AbstractedError(`You must first connect before using the ${kind}() API`, 'not-ready');
    }
    if (!context.app[kind]) {
        throw new errors_1.AbstractedError(`An attempt was made to load the "${kind}" API but that API does not appear to exist!`, 'not-allowed');
    }
    return context.app[kind]();
}
exports._getFirebaseType = _getFirebaseType;
