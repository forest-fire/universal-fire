export var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean || (FirebaseBoolean = {}));
export const VALID_REAL_TIME_EVENTS = [
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
export function isRealTimeEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (VALID_REAL_TIME_EVENTS.includes(e) ? true : false));
}
