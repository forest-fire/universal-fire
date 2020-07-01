export const VALID_FIRESTORE_EVENTS = ['added', 'removed', 'modified'];
/**
 * Validates that all events passed in are valid events for
 * the **Firestore** database.
 *
 * @param events the event or events which are being tested
 */
export function isFirestoreEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (VALID_FIRESTORE_EVENTS.includes(e) ? true : false));
}
//# sourceMappingURL=firestore-types.js.map