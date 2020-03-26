import { ClientConfig } from '@forest-fire/types';
import { FirestoreClient } from '.';

let connected = false;

jest.mock('@forest-fire/firestore', () => {
  class FirestoreDb {
    public connect() {
      connected = true;
    }
  }

  return {
    __esModule: true,
    FirestoreDb
  };
});

describe('FirestoreClient', () => {
  beforeEach(() => {
    connected = false;
  });

  it('should be defined', () => {
    expect(FirestoreClient).toBeDefined();
  });

  describe('static connect', () => {
    it('should connect to Firestore', async () => {
      const config: ClientConfig = {
        databaseURL: 'https://fake.firebaseio.com',
        projectId: 'fake'
      };
      await FirestoreClient.connect(config);

      expect(connected).toEqual(true);
    });
  });
});
