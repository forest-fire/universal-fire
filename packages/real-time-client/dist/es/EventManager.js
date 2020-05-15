import * as events from 'events';
export class EventManager extends events.EventEmitter {
    connection(state) {
        this.emit('connection', state);
    }
}
//# sourceMappingURL=EventManager.js.map