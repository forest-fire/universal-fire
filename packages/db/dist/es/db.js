export class DB {
    /**
     * A static initializer which can hand back any of the supported SDK's for either
     * Firestore or Real-Time Database.
     *
     * @param sdk The Firebase SDK which will be used to connect
     * @param config The database configuration
     *
     */
    static async connect(sdk, config) {
        const constructor = extractConstructor(await import(`@forest-fire/${sdk}`));
        const db = new constructor(config);
        const obj = await db.connect();
        return obj;
    }
}
function extractConstructor(imported) {
    const keys = Object.keys(imported).filter((i) => [
        'RealTimeClient',
        'RealTimeAdmin',
        'FirestoreAdmin',
        'FirestoreClient',
    ].includes(i));
    return imported[keys[0]];
}
//# sourceMappingURL=db.js.map