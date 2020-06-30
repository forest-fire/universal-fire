/// <reference types="node" />
import { EventEmitter } from 'events';
import { IEmitter } from '@forest-fire/real-time-db';
export { IEmitter };
export declare class EventManager extends EventEmitter implements IEmitter {
    connection(state: boolean): void;
}
