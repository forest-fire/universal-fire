# Real Time Database

This part of the source tree is responsible for creating an in-memory representation of the
[Firebase Real Time Database](https://firebase.google.com/docs/database).

```typescript
// for a client representation
const db = RealTimeClient.create( { mocking: true } )
// for the admin representation
const db = RealTimeAdmin.create( { mocking: true } )
```
