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
    class PermissionDenied extends Error {
        constructor(e, context) {
            super(context ? context + ".\n" + e.message : e.message);
            this.stack = e.stack;
            const name = "abstracted-firebase/permission-denied";
            if (e.name === "Error") {
                this.name = name;
            }
            this.code = name.split("/")[1];
            this.stack = e.stack;
        }
    }
    exports.PermissionDenied = PermissionDenied;
});
