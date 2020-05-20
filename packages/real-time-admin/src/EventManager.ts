import { EventEmitter } from 'events';
import type { IEmitter } from '@forest-fire/types';

export class EventManager extends EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit('connection', state);
  }
}
