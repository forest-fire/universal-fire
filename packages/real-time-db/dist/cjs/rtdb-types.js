"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRealTimeEvent = exports.VALID_REAL_TIME_EVENTS = exports.FirebaseBoolean = void 0;
var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean = exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));
exports.VALID_REAL_TIME_EVENTS = [
    'value',
    'child_changed',
    'child_added',
    'child_removed',
    'child_moved',
];
/**
 * Validates that all events passed in are valid events for
 * the **Real Time** database.
 *
 * @param events the event or events which are being tested
 */
function isRealTimeEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (exports.VALID_REAL_TIME_EVENTS.includes(e) ? true : false));
}
exports.isRealTimeEvent = isRealTimeEvent;
