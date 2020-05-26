import * as events from 'events';

import { IEmitter } from '@forest-fire/real-time-db';

export { IEmitter };

export class EventManager extends events.EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit('connection', state);
  }
}
