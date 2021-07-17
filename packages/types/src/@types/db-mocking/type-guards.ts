import { IDictionary } from 'common-types';
import { IMockData } from '../fire-types';
import { IMockDelayedState } from './IMockDelayedState';

export function mockDataIsDelayed<TState>(
  mockData: IMockData<TState>
): mockData is IMockDelayedState<TState> {
  return typeof mockData === 'object' &&
    (mockData as IDictionary).initial &&
    typeof (mockData as IDictionary).connect === 'function'
    ? true
    : false;
}

