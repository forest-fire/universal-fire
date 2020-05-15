"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const events_1 = require("events");
class EventManager extends events_1.EventEmitter {
    connection(state) {
        this.emit('connection', state);
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=EventManager.js.map