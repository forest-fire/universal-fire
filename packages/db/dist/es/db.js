import { FireError } from '@forest-fire/utility';
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
        switch (sdk) {
            case "RealTimeAdmin" /* RealTimeAdmin */:
                return new constructor(config).connect();
            case "RealTimeClient" /* RealTimeClient */:
                return new constructor(config).connect();
            case "FirestoreAdmin" /* FirestoreAdmin */:
                return new constructor(config).connect();
            case "FirestoreClient" /* FirestoreClient */:
                return new constructor(config).connect();
            default:
                throw new FireError(`The SDK requested "${sdk}", is an unknown type!`, 'invalid-sdk');
        }
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