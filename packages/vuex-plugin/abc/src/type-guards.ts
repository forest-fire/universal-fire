import type { IAbcParam } from '~/types';
import { PrimaryKey } from 'firemodel';

export function isDiscreteRequest<T>(request: IAbcParam<T>): request is PrimaryKey<T>[] {
  return typeof request !== 'function';
}
