# Firestore Mock Database

This directory hosts the source for creating an in-memory mock database for
Google's [Firestore DB](https://firebase.google.com/docs/firestore)

```typescript
// for a client representation
const db = FirestoreClient.create( { mocking: true, mockData: data, mockAuth: auth } )
// for the admin representation
const db = FirestoreAdmin.create( { mocking: true, mockData: data, mockAuth: auth } )
```

In the above case, the db connection works with the normal `universal-fire` API but against the mocked database instead of a real one. In addition you can access the following mock-only APIs:

## Store API

The store API provides a way to manipulate the state of the database in a direct and synchronous fashion if this is needed. Typically this should probably be reserved for unit tests.

```typescript
const db = await FirestoreClient.connect( { mocking: true } );
const storeApi = db.mock.store;
storeApi.clearDatabase();
```

## Auth Management API

Users of the mock database can use a mock of Firebase's Auth in the same way they would with a real database:

```typescript
const db = await FirestoreClient.connect( { mocking: true } );
const auth = await db.auth();
```

But if there is a need to get more direct access to the mocking state of the Auth system you can do this via the Auth Management API:

```typescript
const db = await FirestoreClient.connect( { mocking: true } );
const authMgmtApi = db.mock.authManager;
authMgmtApi.addUserToPool(user);
```

This API -- like the Store API -- is not available in the real database so it's use should be carefully considered and typically is just used for testing.