export const WatcherEventWrapper = (context) => (handler) => {
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
