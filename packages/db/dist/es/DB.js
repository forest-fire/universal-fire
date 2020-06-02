export const DB = {
    create: (constructor, config) => {
        return new constructor(config);
    },
    async connect(constructor, config) {
        const obj = new constructor(config);
        await obj.connect();
        return obj;
    },
};
//# sourceMappingURL=DB.js.map