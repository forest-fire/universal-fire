import { IDictionary } from 'common-types';
import {
  Schema,
  Deployment,
  getFakerLibrary,
  importFakerLibrary,
  Queue,
  SchemaCallback,
} from '~/index';
import { FixtureError } from './errors/FixtureError';

export class Fixture<T extends IDictionary> {
  private _schema: Schema;
  private store: Partial<T>;

  /**
   * Static initializer
   */
  public static async prepare<T extends IDictionary = IDictionary>() {
    await importFakerLibrary();

    const obj = new Fixture<T>();

    return obj;
  }

  public get deploy() {
    return new Deployment();
  }

  constructor() {
    Queue.clearAll();
    this.store = {};
  }

  /**
   * returns an instance static FakerJS libraray
   */
  public get faker() {
    return getFakerLibrary();
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
    const faker = getFakerLibrary();
    if (!faker && !faker.address) {
      throw new FixtureError(
        `The Faker library must be loaded before you can generate mocked data can be returned`,
        'firemock/faker-not-ready'
      );
    }
    return new Deployment().generate<T>();
  }
}
