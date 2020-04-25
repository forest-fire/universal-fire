import first from 'lodash.first';
import last from 'lodash.last';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';
import './test-console'; // TS declaration
import { stdout, stderr } from 'test-console';
export function restoreStdoutAndStderr() {
    console._restored = true;
}
export async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function setupEnv() {
    if (!process.env.AWS_STAGE) {
        process.env.AWS_STAGE = 'test';
    }
    if (process.env.MOCK === undefined) {
        process.env.MOCK = 'true';
    }
    const current = process.env;
    const yamlConfig = yaml.safeLoad(fs.readFileSync('./env.yml', 'utf8'));
    const combined = {
        ...yamlConfig[process.env.AWS_STAGE],
        ...process.env
    };
    Object.keys(combined).forEach(key => (process.env[key] = combined[key]));
    return combined;
}
export function ignoreStdout() {
    const rStdout = stdout.ignore();
    const restore = () => {
        rStdout();
        console._restored = true;
    };
    return restore;
}
export function captureStdout() {
    const rStdout = stdout.inspect();
    const restore = () => {
        rStdout.restore();
        console._restored = true;
        return rStdout.output;
    };
    return restore;
}
export function captureStderr() {
    const rStderr = stderr.inspect();
    const restore = () => {
        rStderr.restore();
        console._restored = true;
        return rStderr.output;
    };
    return restore;
}
export function ignoreStderr() {
    const rStdErr = stderr.ignore();
    const restore = () => {
        rStdErr();
        console._restored = true;
    };
    return restore;
}
export function ignoreBoth() {
    const rStdOut = stdout.ignore();
    const rStdErr = stderr.ignore();
    const restore = () => {
        rStdOut();
        rStdErr();
        console._restored = true;
    };
    return restore;
}
/**
 * The first key in a Hash/Dictionary
 */
export function firstKey(dictionary) {
    return first(Object.keys(dictionary));
}
/**
 * The first record in a Hash/Dictionary of records
 */
export function firstRecord(dictionary) {
    return dictionary[this.firstKey(dictionary)];
}
/**
 * The last key in a Hash/Dictionary
 */
export function lastKey(listOf) {
    return last(Object.keys(listOf));
}
/**
 * The last record in a Hash/Dictionary of records
 */
export function lastRecord(dictionary) {
    return dictionary[this.lastKey(dictionary)];
}
export function valuesOf(listOf, property) {
    const keys = Object.keys(listOf);
    return keys.map((key) => {
        const item = listOf[key];
        return item[property];
    });
}
export function length(listOf) {
    return listOf ? Object.keys(listOf).length : 0;
}
//# sourceMappingURL=helpers.js.map