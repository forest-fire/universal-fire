"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRealTimeEvent = exports.FirebaseBoolean = void 0;
var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean = exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));
function isRealTimeEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => [
        'value',
        'child_changed',
        'child_added',
        'child_removed',
        'child_moved',
    ].includes(e)
        ? true
        : false);
}
exports.isRealTimeEvent = isRealTimeEvent;
