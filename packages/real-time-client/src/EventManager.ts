import * as events from "events";
import { IEmitter } from "abstracted-firebase";

export class EventManager extends events.EventEmitter implements IEmitter {
  public connection(state: boolean) {
    this.emit("connection", state);
  }
}
