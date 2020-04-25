"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var RealTimeDb_1 = require("./RealTimeDb");
exports.RealTimeDb = RealTimeDb_1.RealTimeDb;
var FileDepthExceeded_1 = require("./errors/FileDepthExceeded");
exports.FileDepthExceeded = FileDepthExceeded_1.FileDepthExceeded;
var UndefinedAssignment_1 = require("./errors/UndefinedAssignment");
exports.UndefinedAssignment = UndefinedAssignment_1.UndefinedAssignment;
var util_1 = require("./util");
exports._getFirebaseType = util_1._getFirebaseType;
__export(require("./mockingSymbols"));
__export(require("./types"));
function isMockConfig(config = {}) {
    return config.mocking === true;
}
exports.isMockConfig = isMockConfig;
function isRealDbConfig(config) {
    return config.mocking !== true;
}
exports.isRealDbConfig = isRealDbConfig;
//TODO: Clean this file up; should ONLY be exports not function definitions!
__export(require("./RealTimeDb"));
