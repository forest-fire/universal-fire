(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "firemock"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var firemock_1 = require("firemock");
    exports.getMockHelper = firemock_1.getMockHelper;
    exports.MockHelper = firemock_1.MockHelper;
    exports.FireMock = firemock_1.Mock;
});
