(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FileDepthExceeded extends Error {
        constructor(e) {
            super(e.message);
            this.stack = e.stack;
            const name = "abstracted-firebase/depth-exceeded";
            if (e.name === "Error") {
                this.name = name;
            }
            this.code = name.split("/")[1];
            this.stack = e.stack;
        }
    }
    exports.FileDepthExceeded = FileDepthExceeded;
});
