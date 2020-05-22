export async function RealTimeClient(config) {
    const constructor = (await import(
    /* webpackChunkName: "real-time-client" */ '@forest-fire/real-time-client')).RealTimeClient;
    return constructor.connect(config);
}
export async function FirestoreClient(config) {
    const constructor = (await import(
    /* webpackChunkName: "firestore-client" */ '@forest-fire/firestore-client')).FirestoreClient;
    return constructor.connect(config);
}
//# sourceMappingURL=client-sdks.js.map