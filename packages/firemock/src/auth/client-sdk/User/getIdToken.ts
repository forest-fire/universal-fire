import { IMockAuthMgmt, NetworkDelay, ClientSdk } from '@forest-fire/types';
import { atRandom } from 'native-dash';
import { networkDelay } from '../../../util';

export function getIdToken(api: IMockAuthMgmt<ClientSdk>) {
  return async (): Promise<string> => {
    const user = api.getCurrentUser();

    await networkDelay(NetworkDelay.wifi);

    if (!user) {
      throw new Error('not logged in');
    }
    if (user.tokenIds) {
      return atRandom(user.tokenIds);
    } else {
      return Math.random().toString(36).substr(2, 10);
    }
  };
}
