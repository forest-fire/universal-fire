import { NetworkDelay } from '../../../types/src';
import { ms, wait } from 'common-types';
import { between } from 'native-dash';

export async function networkDelay(
  delay: [number, number] | number | NetworkDelay
): Promise<void> {
  let waitFor: ms;
  if (typeof delay === 'number') {
    waitFor = delay;
  } else if (Array.isArray(delay)) {
    waitFor = between(...delay);
  } else {
    const lookup: { [key in NetworkDelay]: [number, number] } = {
      [NetworkDelay.lifi]: [10, 10000],
      [NetworkDelay.mobile2g]: [300, 1200],
      [NetworkDelay.mobile3g]: [200, 750],
      [NetworkDelay.mobile4g]: [75, 200],
      [NetworkDelay.wifi]: [25, 75],
      [NetworkDelay.lazer]: [1, 5],
    };
    waitFor = between(...lookup[delay]);
  }

  await wait(waitFor);
}
