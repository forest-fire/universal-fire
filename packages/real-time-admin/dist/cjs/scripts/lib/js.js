"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const chalk_1 = __importDefault(require("chalk"));
const async_shelljs_1 = require("async-shelljs");
const rm = __importStar(require("rimraf"));
async function transpileJavascript(options = {}) {
    console.log(chalk_1.default.bold.yellow(`- starting JS build process ${options.configFile ? "[ " + options.configFile + " ]" : ""}`));
    console.log(chalk_1.default.dim(`- transpiling typescript ( `) +
        chalk_1.default.dim.grey(`./node_modules/.bin/tsc ${options.scope}`) +
        chalk_1.default.dim(` )`));
    try {
        await async_shelljs_1.asyncExec(`./node_modules/.bin/tsc ${options.configFile ? "-p " + options.configFile : ""} ${options.scope}`);
        console.log(chalk_1.default.green.bold(`- JS build completed successfully 👍`));
    }
    catch (e) {
        console.log(chalk_1.default.red.bold(`\n- Completed with code: ${e.code}  😡 `));
        console.log(chalk_1.default.red(`- Error was:\n`) + e.message + "\n");
        throw new Error("Problem with build step, see above");
    }
    return;
}
exports.transpileJavascript = transpileJavascript;
async function clearTranspiledJS() {
    return new Promise(resolve => {
        rm("lib", () => {
            console.log(chalk_1.default.dim("- cleared LIB directory of all previous files"));
            resolve();
        });
    });
}
exports.clearTranspiledJS = clearTranspiledJS;
async function lintSource() {
    return async_shelljs_1.asyncExec(`tslint src/**/*`);
}
exports.lintSource = lintSource;
//# sourceMappingURL=js.js.map