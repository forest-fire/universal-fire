import { AbstractedError } from './index';
import type { RealTimeDb } from './index';

export function slashNotation(path: string) {
  return path.substr(0, 5) === '.info'
    ? path.substr(0, 5) + path.substring(5).replace(/\./g, '/')
    : path.replace(/\./g, '/');
}

export function _getFirebaseType<T extends RealTimeDb>(
  context: T,
  kind: string
) {
  if (!context.isConnected) {
    throw new AbstractedError(
      `You must first connect before using the ${kind}() API`,
      'not-ready'
    );
  }

  if (!(context as any).app[kind]) {
    throw new AbstractedError(
      `An attempt was made to load the "${kind}" API but that API does not appear to exist!`,
      'not-allowed'
    );
  }

  return (context as any).app[kind]();
}
