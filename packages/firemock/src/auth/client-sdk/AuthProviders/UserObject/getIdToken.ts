import { allUsers, currentUser } from '../../../state-mgmt';

import { atRandom } from '../../../../util/atRandom';

export async function getIdToken() {
  const user = currentUser();
  const userConfig = allUsers().find((i) => i.email === user.email);

  if (!user) {
    throw new Error('not logged in');
  }
  if (userConfig.tokenIds) {
    return atRandom(userConfig.tokenIds);
  } else {
    return Math.random().toString(36).substr(2, 10);
  }
}
