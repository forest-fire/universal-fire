import { Store } from 'vuex';
import { IRootState, setupStore } from './store';
import { firemodelMutations } from '~/store/firemodelMutations/mutations';

describe('local change effects @firemodel state', () => {
  let store: Store<IRootState>;
  beforeAll(() => {
    store = setupStore({ foo: 'bar' });
  });
  it('adding a new record results in addition to "onlyLocal"', async () => {
    expect(store).not.toBeUndefined();
  });

  it('updating a new record results in addition to "onlyLocal"', async () => {
    //
  });

  it('removing a new record results in addition to "onlyLocal"', async () => {
    //
  });
});

describe('local changes effect state in modules using fireModules', () => {
  it('adding a new record results module state being changed appropriately', async () => {
    //
  });

  it('updating a new record results module state being changed appropriately', async () => {
    //
  });

  it('removing a new record results module state being changed appropriately', async () => {
    //
  });
});
