# Firemock

A _mock_ database and auth API which works just like a Firebase database when using `universal-fire` database connections.

## Example

For a library author, creating a `universal-fire` DB SDK, you would do something like:

```ts
import firemock from 'firemock';
export class MyConnection extends IDatabaseSdk {
  public async connectMockDb(mockData: IMockData, mockAuth: IMockAuthConfig) {
    await firemock.connect<IClientAuth>(this, mockData, mockAuth);
  }
}
```

However, this is all unnecessary detail if you're just a consumer of Firemock, here you'd simply
do something like:

```ts
import { RealTimeClient } from 'universal-fire';
const db = await RealTimeClient.connect({ mocking: true, mockData, mockAuth })
```

behind the scenes, the SDK you've chosen -- in this example `RealTimeClient` -- will link up the Firemock database for you and you'll be up and running with an API that is 100% the same as you'd use with a real database.