import type { FakerStatic } from '@forest-fire/types';
import { FixtureError } from './errors/FixtureError';

let faker: FakerStatic;

/**
 * **importFakerLibrary**
 *
 * The **faker** library is a key part of effective mocking but
 * it is a large library so we only want to import it when
 * it's required. Calling this _async_ method will ensure that
 * before you're mocking with faker available.
 */
export async function importFakerLibrary() {
  if (!faker) {
    faker = await import(/* webpackChunkName: "faker-lib" */ 'faker');
  }
  return faker;
}

/**
 * Assuming you've already loaded the faker library, this returns the library
 * synchronously
 */
export function getFakerLibrary() {
  if (!faker) {
    throw new FixtureError(
      `The faker library has not been loaded yet! Use the importFakerLibrary() directly to ensure this happens first; or alternatively you can use Mock.prepare().`,
      'not-ready'
    );
  }

  return faker;
}
