"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirestoreEvent = exports.VALID_FIRESTORE_EVENTS = void 0;
exports.VALID_FIRESTORE_EVENTS = ['added', 'removed', 'modified'];
/**
 * Validates that all events passed in are valid events for
 * the **Firestore** database.
 *
 * @param events the event or events which are being tested
 */
function isFirestoreEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (exports.VALID_FIRESTORE_EVENTS.includes(e) ? true : false));
}
exports.isFirestoreEvent = isFirestoreEvent;
//# sourceMappingURL=firestore-types.js.map