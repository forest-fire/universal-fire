"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Disconnected /** implements firebase.database.OnDisconnect */ {
    cancel(onComplete) {
        return Promise.resolve();
    }
    remove(onComplete) {
        return Promise.resolve();
    }
    set(value, onComplete) {
        return Promise.resolve();
    }
    setWithPriority(value, priority, onComplete) {
        return Promise.resolve();
    }
    update(values, onComplete) {
        return Promise.resolve();
    }
}
exports.default = Disconnected;
//# sourceMappingURL=Disconnected.js.map