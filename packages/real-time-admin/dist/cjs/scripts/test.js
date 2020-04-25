"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const chalk = __importStar(require("chalk"));
const shelljs_1 = require("shelljs");
const rm = __importStar(require("rimraf"));
const process = __importStar(require("process"));
const program = __importStar(require("commander"));
require("../test/testing/test-console");
function getScope(files) {
    let fileScope;
    if (!files || files === "all") {
        console.log(chalk.white("no specific files specified so all files being tested, use -h for more help"));
        fileScope = "--recursive test/**/*-spec.ts";
    }
    else {
        const prefix = files.slice(0, 5) === "test/" ? "" : "test/";
        const postfix = files.slice(-5) === "-spec" ? "" : "-spec";
        fileScope = prefix + files + postfix + ".ts";
    }
    console.log(chalk.green(`${chalk.bold("mocha")} --compilers ts:ts-node/register  ${fileScope}`));
    return fileScope;
}
/**
 * No transpiled JS files should be in TEST directories
 * as testing is using ts-node; remove these files as they
 * may represent unintentional stale tests
 */
function cleanJSTests() {
    return new Promise((resolve, reject) => {
        rm("test/**/*.js", e => {
            if (e) {
                reject(e);
            }
            else {
                resolve();
            }
        });
    });
}
async function executeTests(stg, fileScope) {
    process.env.AWS_STAGE = stg;
    process.env.TS_NODE_COMPILER_OPTIONS = '{ "noImplicitAny": false }';
    await shelljs_1.exec(`mocha --exit --require ts-node/register ` + fileScope);
}
if (process.argv.length === 2) {
    console.log(`No tests specified, running ${chalk.bold("all")} tests.`);
    process.argv.push("all");
}
program
    .arguments("[files]")
    .option("-s, --stage [env]", "Environment to use", /^(dev|test|stage|prod)^/, "test")
    .option("-f, --files", "an alternative syntax to just specifying files as first argument on command line")
    .action(async (files) => {
    console.log(files, program.stage);
    await cleanJSTests();
    const stage = program.stage;
    const scope = getScope(files);
    console.log("scope:", scope);
    await executeTests(stage, scope);
    console.log("tests complete");
})
    .parse(process.argv);
//# sourceMappingURL=test.js.map