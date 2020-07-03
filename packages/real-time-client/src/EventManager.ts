import * as events from 'events'; // TODO(lukeed) this is node-only
import type { IEmitter } from '@forest-fire/real-time-db';

export class EventManager extends events.EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit('connection', state);
  }
}
