/// <reference types="node" />
import { EventEmitter } from 'events';
import type { IEmitter } from '@forest-fire/types';
export declare class EventManager extends EventEmitter implements IEmitter {
    connection(state: boolean): void;
}
