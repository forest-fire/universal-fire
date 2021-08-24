import { ISchemaHelper } from '~/@types';
import type { IFakerStatic } from '@forest-fire/types';

export class SchemaHelper<T = any> implements ISchemaHelper<T> {
  /**
   * static initializer which allows the **faker** library
   * to be instantiated asynchronously. Alternatively,
   * you can pass in an instance of faker to this function
   * to avoid any need for delay.
   *
   * Note: the _constructor_ also allows passing the faker
   * library in so this initializer's main "value" is to
   * ensure that faker is ready before the faker getter is
   * used.
   */
  static create<T = any>(context: T, faker?: IFakerStatic): SchemaHelper<T> {
    const obj = new SchemaHelper(context, faker);
    return obj;
  }

  private _faker: IFakerStatic;

  constructor(public context: T, faker?: IFakerStatic) {
    if (faker) {
      this._faker = faker;
    }
  }
  public get faker(): IFakerStatic {
    return this._faker;
  }
}
