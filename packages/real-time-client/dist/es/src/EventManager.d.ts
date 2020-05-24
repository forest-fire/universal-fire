/// <reference types="node" />
import * as events from 'events';
import { IEmitter } from '@forest-fire/real-time-db';
export declare type EventEmitter = events.EventEmitter;
export declare class EventManager extends events.EventEmitter implements IEmitter {
    connection(state: boolean): void;
}
