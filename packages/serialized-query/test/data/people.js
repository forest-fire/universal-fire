"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleDataset = void 0;
exports.peopleDataset = () => ({
    authenticated: {
        people: {
            a: {
                name: 'Oldy McOldy',
                age: 99,
                favoriteColor: 'blue',
                createdAt: new Date().getTime() - 100000,
                lastUpdated: new Date().getTime(),
            },
            b: {
                name: 'Midlife Crises',
                age: 50,
                favoriteColor: 'blue',
                createdAt: new Date().getTime() - 200005,
                lastUpdated: new Date().getTime() - 5000,
            },
            c: {
                name: 'Babyface Bob',
                age: 3,
                favoriteColor: 'blue',
                createdAt: new Date().getTime() - 200000,
                lastUpdated: new Date().getTime() - 2000,
            },
            d: {
                name: 'Punkass Teen',
                age: 17,
                favoriteColor: 'green',
                createdAt: new Date().getTime() - 100005,
                lastUpdated: new Date().getTime() - 10000,
            },
            e: {
                name: 'Old Fart',
                age: 98,
                favoriteColor: 'green',
                createdAt: new Date().getTime() - 100005,
                lastUpdated: new Date().getTime() - 10000,
            },
        },
    },
});
//# sourceMappingURL=people.js.map