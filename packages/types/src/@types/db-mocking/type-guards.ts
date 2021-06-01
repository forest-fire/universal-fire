import { IDictionary } from 'common-types';
import { IAbstractedDatabase } from '../abstracted-database';
import { IMockData } from '../fire-types';
import { IAdminAuth, IClientAuth, IMockDatabase } from '../index';
import { IMockDelayedState } from './IMockDelayedState';

/**
 * Detects whether the given Mock Admin includes "auth" functionality
 * and narrows the type accordingly.
 */
export function hasAuthMock(mock: IMockDatabase): mock is IMockDatabase {
  return (mock as any).kind === 'mock-db-without-auth' ? false : true;
}

export function mockDataIsDelayed<TState>(
  mockData: IMockData<TState>
): mockData is IMockDelayedState<TState> {
  return typeof mockData === 'object' &&
    (mockData as IDictionary).initial &&
    typeof (mockData as IDictionary).connect === 'function'
    ? true
    : false;
}
