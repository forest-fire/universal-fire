import Vuex, { Store } from 'vuex';
import FiremodelPlugin, {
  EmailAuthProvider,
  FireModel,
  Record,
  signInWithEmailAndPassword,
  Watch,
  updateEmail,
  signOut,
} from '~/index';
import { IRootState, setupStore } from './store';
import { RealTimeClient } from '@forest-fire/real-time-client';
import { AuthProviderName } from '@forest-fire/types';
import { wait } from 'common-types';
import Vue from 'vue';

describe('Auth spec', () => {
  let store: Store<IRootState>;
  beforeEach(async () => {
    const task = new Promise((resolve) => {
      store = setupStore();
      const expectedMutations = [
        '@firemodel/LIFECYCLE_EVENT_COMPLETED',
        '@firemodel/CONFIGURE',
        '@firemodel/CORE_SERVICES_STARTED',
      ];
      const mutationsCommited: string[] = [];
      store.subscribe((payload, state) => {
        if (expectedMutations.includes(payload.type)) {
          mutationsCommited.push(payload.type);
        }
        if (expectedMutations.every((a) => mutationsCommited.includes(a))) {
          resolve(true);
        }
      });
    });

    await task;
  });

  afterEach(async () => {
    FireModel.defaultDb = undefined;
    store = undefined;
  });

  it('Sign in with email and password returns user credentials successfully', async () => {
    const userCredential = await signInWithEmailAndPassword('test@test.com', 'foobar');
    expect(userCredential.user.uid).not.toBeUndefined();
    expect(userCredential.user.email).toBe('test@test.com');
    expect(userCredential.user.emailVerified).toBeTruthy();
  });
});
