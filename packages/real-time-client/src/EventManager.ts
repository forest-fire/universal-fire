import { EventEmitter } from 'events';
import { IEmitter } from '@forest-fire/real-time-db';

export { IEmitter };

export class EventManager extends EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit('connection', state);
  }
}
