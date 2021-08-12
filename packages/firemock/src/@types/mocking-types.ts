import type { IFakerStatic } from '@forest-fire/types';

export interface ISchemaHelper<T extends unknown> {
  context: T;
  faker: IFakerStatic;
}
