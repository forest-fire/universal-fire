import { IDictionary } from 'common-types';
import {
  Schema,
  Deployment,
  Queue,
  SchemaCallback,
} from '~/index';

export class Fixture<T extends IDictionary> {
  private _schema: Schema;
  private store: Partial<T>;

  /**
   * Static initializer
   */
  public static prepare<T extends IDictionary = IDictionary>() {
    const obj = new Fixture<T>();

    return obj;
  }

  public get deploy() {
    return new Deployment<T>();
  }

  constructor() {
    Queue.clearAll();
    this.store = {};
  }

  public addSchema(schema: string, mock?: SchemaCallback<T>) {
    if (!this._schema) {
      this._schema = new Schema(schema, mock);
    } else {
      this._schema.addSchema(schema, mock);
    }
    return this._schema;
  }

  public queueSchema(
    schemaId: string,
    quantity: number = 1,
    overrides: IDictionary = {}
  ) {
    new Deployment<T>().queueSchema(
      schemaId,
      quantity,
      overrides
    );
    return this;
  }

  public generate<T extends any>(): T {
    return new Deployment<T>().generate();
  }
}
