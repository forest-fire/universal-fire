# Real Time Database

This part of the source tree is responsible for creating an in-memory representation of the
[Firebase Real Time Database](https://firebase.google.com/docs/database).

```typescript
// for a client representation
const db = RealTimeClient.create( { mocking: true } )
// for the admin representation
const db = RealTimeAdmin.create( { mocking: true } )
```

## Configuring the Database

There are two main config paths: `mockDb` and `mockAuth`:

1. `mockDb` - you can either synchronously set the state or pass in an async function which will resolve to the state of the database once it "connects".
2. `mockAuth` - you can set both the _authorizers_ you want to allow as know you see as the "known users" so that people may login to the DB:

    ```typescript
    const db = RealTimeAdmin.connect( { 
      mocking: true, 
      mockAuth: {
        providers: ['emailPassword', 'facebook'],
        users: [ {...}, {...} ]
      }
    })
    ```

    Both properties can be set synchronously or asynchronously. To set the properties asynchronously you would do something like:

    ```typescript
    const db = RealTimeAdmin.connect( { 
      mocking: true, 
      mockAuth: {
        providers: () => axios.get(`https://somewhere.com/${process.ENV.NODE_ENV}/user_auth.json`),
        users: () => axios.get(`https://somewhere.com/${process.ENV.NODE_ENV}/user_auth.json`)
      }
    })
    ```