export async function FirestoreClient(config) {
    const constructor = (await import(
    /* webpackChunkName: "firestore-client" */ '@forest-fire/firestore-client')).FirestoreClient;
    return constructor.connect(config);
}
//# sourceMappingURL=FirestoreClient.js.map