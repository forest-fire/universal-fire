// tslint:disable:no-implicit-dependencies
import chalk from "chalk";
import { exec } from "shelljs";
import "../test/testing/test-console";
import { stdout } from "test-console";
import { transpileJavascript, clearTranspiledJS } from "./lib/js";
import { asyncExec } from "async-shelljs";
function prepOutput(output) {
    return output
        .replace(/\t\r\n/, "")
        .replace("undefined", "")
        .trim();
}
async function getScope() {
    let scope;
    return new Promise(resolve => {
        const inspect = stdout.inspect();
        exec(`npm get files`, (code, output) => {
            inspect.restore();
            const result = prepOutput(output);
            if (!result) {
                console.log(chalk.grey('no files specified with "--files=*" option so all files under src directory will be built\n'));
                scope = "";
            }
            else {
                scope = result;
            }
            resolve(scope);
        });
    });
}
(async () => {
    const scope = await getScope();
    await clearTranspiledJS();
    await transpileJavascript({ scope });
    // await transpileJavascript({ scope, configFile: "tsconfig-esm.json" });
    await asyncExec("bili lib/index.js --format es");
})();
//# sourceMappingURL=build.js.map