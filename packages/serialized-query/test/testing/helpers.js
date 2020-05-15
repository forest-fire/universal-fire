"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.length = exports.valuesOf = exports.lastRecord = exports.lastKey = exports.firstRecord = exports.firstKey = exports.ignoreBoth = exports.ignoreStderr = exports.captureStderr = exports.captureStdout = exports.ignoreStdout = exports.setupEnv = exports.timeout = exports.wait = exports.restoreStdoutAndStderr = void 0;
const fs = __importStar(require("fs"));
const process = __importStar(require("process"));
const yaml = __importStar(require("js-yaml"));
const lodash_first_1 = __importDefault(require("lodash.first"));
const lodash_last_1 = __importDefault(require("lodash.last"));
const test_console_1 = require("test-console");
require("./test-console");
function restoreStdoutAndStderr() {
    console._restored = true;
}
exports.restoreStdoutAndStderr = restoreStdoutAndStderr;
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.timeout = timeout;
function setupEnv() {
    if (!process.env.AWS_STAGE) {
        process.env.AWS_STAGE = 'test';
    }
    const current = process.env;
    const yamlConfig = yaml.safeLoad(fs.readFileSync('./env.yml', 'utf8'));
    const combined = {
        ...yamlConfig[process.env.AWS_STAGE],
        ...process.env
    };
    console.log(`Loading ENV for "${process.env.AWS_STAGE}"`);
    Object.keys(combined).forEach(key => (process.env[key] = combined[key]));
    return combined;
}
exports.setupEnv = setupEnv;
function ignoreStdout() {
    const rStdout = test_console_1.stdout.ignore();
    const restore = () => {
        rStdout();
        console._restored = true;
    };
    return restore;
}
exports.ignoreStdout = ignoreStdout;
function captureStdout() {
    const rStdout = test_console_1.stdout.inspect();
    const restore = () => {
        rStdout.restore();
        console._restored = true;
        return rStdout.output;
    };
    return restore;
}
exports.captureStdout = captureStdout;
function captureStderr() {
    const rStderr = test_console_1.stderr.inspect();
    const restore = () => {
        rStderr.restore();
        console._restored = true;
        return rStderr.output;
    };
    return restore;
}
exports.captureStderr = captureStderr;
function ignoreStderr() {
    const rStdErr = test_console_1.stderr.ignore();
    const restore = () => {
        rStdErr();
        console._restored = true;
    };
    return restore;
}
exports.ignoreStderr = ignoreStderr;
function ignoreBoth() {
    const rStdOut = test_console_1.stdout.ignore();
    const rStdErr = test_console_1.stderr.ignore();
    const restore = () => {
        rStdOut();
        rStdErr();
        console._restored = true;
    };
    return restore;
}
exports.ignoreBoth = ignoreBoth;
/**
 * The first key in a Hash/Dictionary
 */
function firstKey(dictionary) {
    return lodash_first_1.default(Object.keys(dictionary));
}
exports.firstKey = firstKey;
/**
 * The first record in a Hash/Dictionary of records
 */
function firstRecord(dictionary) {
    return dictionary[this.firstKey(dictionary)];
}
exports.firstRecord = firstRecord;
/**
 * The last key in a Hash/Dictionary
 */
function lastKey(listOf) {
    return lodash_last_1.default(Object.keys(listOf));
}
exports.lastKey = lastKey;
/**
 * The last record in a Hash/Dictionary of records
 */
function lastRecord(dictionary) {
    return dictionary[this.lastKey(dictionary)];
}
exports.lastRecord = lastRecord;
function valuesOf(listOf, property) {
    const keys = Object.keys(listOf);
    return keys.map((key) => {
        const item = listOf[key];
        return item[property];
    });
}
exports.valuesOf = valuesOf;
function length(listOf) {
    return listOf ? Object.keys(listOf).length : 0;
}
exports.length = length;
//# sourceMappingURL=helpers.js.map