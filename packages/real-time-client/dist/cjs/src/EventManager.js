"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const events = __importStar(require("events"));
class EventManager extends events.EventEmitter {
    connection(state) {
        this.emit("connection", state);
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=EventManager.js.map