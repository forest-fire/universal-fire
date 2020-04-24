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
    class UndefinedAssignment extends Error {
        constructor(e) {
            super(e.message);
            this.stack = e.stack;
            if (e.name === "Error") {
                e.name = "AbstractedFirebase";
            }
        }
    }
    exports.UndefinedAssignment = UndefinedAssignment;
});
