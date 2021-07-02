import type { FakerStatic } from '@forest-fire/types';

export interface ISchemaHelper<T extends unknown> {
  context: T;
  faker: FakerStatic;
}
