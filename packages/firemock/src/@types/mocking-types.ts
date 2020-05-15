import type { FakerStatic } from '@forest-fire/types';

export interface ISchemaHelper<T = any> {
  context: T;
  faker: FakerStatic;
}
