import { Database } from '.';

jest.mock('@forest-fire/firestore', () => {
  class FirestoreDb {
    connect() {}
  }

  return {
    __esModule: true,
    FirestoreDb
  };
});

describe('Database', () => {
  it('should be defined', () => {
    expect(Database).toBeDefined();
  });

  describe('static connect', () => {
    it('should connect to Firestore using the client configuration', async () => {
      const db = await Database.connect({
        databaseURL: 'https://fake.firebaseio.com',
        projectId: 'fake'
      });

      expect(db.constructor.name).toEqual('FirestoreClient');
    });

    it('should throw an [Error: Not implemented] when connecting to Firestore using the admin configuration', async () => {
      try {
        await Database.connect({
          serviceAccountId: '',
          projectId: 'fake'
        });
      } catch (err) {
        expect(err.message).toEqual('Not implemented');
      }
    });
  });
});
