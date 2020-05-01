---
prev: /crud.html
next: /watch.html
---
# Query Operations

All of the READ operations discussed in the CRUD section returned a single database path and this resembles in a more typical database where you query the database for a single "record". The concept of a record does now exist in **Firestore** but in the **Real Time Database** the terms and data structure were all a little bit loose. In any case, most people would recognize that both databases typically do have structure in the database and that the idea of a model/schema and then consequently a "record" all makes a lot of sense.

That said, where the GET operation was about getting a single record, a query is about getting a _list_ of records. This section will show the methods available to you -- using either underlying database -- to query the database.




to query the database but of course Firebase provides many tools to fine tune what we want the server to return. All of these parameters we're used to having off the Firebase Query API are available from a separate `SerializedQuery` class which is exported as a named export of **abstraced-admin**. You would use it like so:

## Query Building

```ts
import { SerializedQuery } from "abstracted-admin";
const recentTransactionsEU = SerializedQuery.path("/transactions")
  .orderByChild("date")
  .limitToLast(20)
  .equalTo("europe", "region");
```

As a convenience method you can also access SerializedQuery directly off your abstracted admin object with the `query` property:

```ts
import DB from "abstracted-admin";
const db = new DB();
const recentTransactionsEU = DB.query
  .path("/transactions")
  .orderByChild("date")
  .limitToLast(20)
  .equalTo("europe", "region");
```

As you can see the Query class provides a _fluent_ interface that any firebase developer should feel right at home with. Once you've defined your query you can use any of the above READ operations and instead of passing in the path just pass in the query:

```ts
const db = new DB();
const transactions = await db.getList<ITransaction>(recentTransactionsEU);
```
