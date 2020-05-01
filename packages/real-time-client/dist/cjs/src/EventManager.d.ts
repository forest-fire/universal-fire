/// <reference types="node" />
import * as events from "events";
import { IEmitter } from "abstracted-firebase";
export declare class EventManager extends events.EventEmitter implements IEmitter {
    connection(state: boolean): void;
}
