(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./FileDepthExceeded", "./PermissionDenied", "./UndefinedAssignment", "./AbstractedError", "./AbstractedProxyError"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./FileDepthExceeded"));
    __export(require("./PermissionDenied"));
    __export(require("./UndefinedAssignment"));
    __export(require("./AbstractedError"));
    __export(require("./AbstractedProxyError"));
});
