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
    exports.WatcherEventWrapper = (context) => (handler) => {
        return (snapshot, previousChildKey) => {
            const value = snapshot.val();
            const key = snapshot.key;
            const kind = "server-event";
            const fullEvent = Object.assign(Object.assign({}, context), { value,
                key,
                kind,
                previousChildKey });
            return handler(fullEvent);
        };
    };
});
