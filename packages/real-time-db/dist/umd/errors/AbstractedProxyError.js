(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "common-types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const common_types_1 = require("common-types");
    class AbstractedProxyError extends Error {
        constructor(e, typeSubtype = null, context) {
            super("");
            this.stack = e.stack;
            const parts = (typeSubtype ||
                `abstracted-firebase/${e.name || e.code || e.type || "unknown"}`).split("/");
            const [type, subType] = parts.length === 2 ? parts : ["abstracted-firemodel", parts[0]];
            this.name = `${type}/${subType}`;
            this.code = `${subType}`;
            this.stack = e.stack;
            try {
                this.stackFrames = common_types_1.parseStack(this.stack, {
                    ignorePatterns: ["timers.js", "mocha/lib", "runners/node"]
                });
            }
            catch (e) {
                // ignore if there was an error parsing
            }
            const shortStack = this.stackFrames
                ? this.stackFrames
                    .slice(0, Math.min(3, this.stackFrames.length - 1))
                    .map(i => `${i.shortPath}/${i.fn}::${i.line}`)
                : "";
            this.message = context
                ? `${e.name ? `[Proxy of ${e.name}]` : ""}` +
                    context +
                    ".\n" +
                    e.message +
                    `\n${shortStack}`
                : `${e.name ? `[Proxy of ${e.name}]` : ""}[ ${type}/${subType}]: ${e.message}\n${shortStack}`;
        }
    }
    exports.AbstractedProxyError = AbstractedProxyError;
});
