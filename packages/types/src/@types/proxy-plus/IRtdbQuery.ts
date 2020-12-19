type _IRtdbQuery_ = import('@firebase/database-types').Query;

/**
 * The RTDB `Query` interface with verbose documentation included
 */
export interface IRtdbQuery extends _IRtdbQuery_ {
  /**
   * **endAt**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#endAt),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#section-rest-filtering) ]
   *
   * Creates a Query with a specified _ending point_.
   */
  endAt: import('@firebase/database-types').Query['endAt'];
  /**
   * **equalTo**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#equalto),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#equalto),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#section-rest-filtering) ]
   *
   * Creates a Query that includes children that match the specified value.
   *
   * Using startAt(), endAt(), and equalTo() allows us to choose arbitrary starting and ending
   * points for our queries.
   *
   * The optional key argument can be used to further limit the range of the query. If it is specified,
   * then children that have exactly the specified value must also have exactly the specified key as
   * their key name. This can be used to filter result sets with many matches for the same value.
   *
   * ### Firebase Example
   *
   * ```ts
   * var const = db.ref("dinosaurs")
   *    .orderByChild("height")
   *    .equalTo(25)
   *    .on("child_added", (snapshot) => { console.log(snapshot.key); });
   * ```
   */
  equalTo: import('@firebase/database-types').Query['equalTo'];
  /**
   * **isEqual**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#isEqual),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#isequal),
   * [~rest~]() ]
   *
   * Returns whether or not the current and provided queries represent the same location, have the same query
   * parameters, and are from the same instance of the Firebase **App**
   */
  isEqual: import('@firebase/database-types').Query['isEqual'];
  /**
   * **limitToFirst**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#limittofirst),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#limit-queries) ]
   *
   * Generates a new Query limited to the first specific number of children.
   */
  limitToFirst: import('@firebase/database-types').Query['limitToFirst'];
  /**
   * **limitToLast**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToLast),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#limittolast),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#limit-queries) ]
   *
   * Generates a new Query limited to the last specific number of children.
   */
  limitToLast: import('@firebase/database-types').Query['limitToLast'];

  /**
   * **off**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#off),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#off),
   * [~rest~]() ]
   *
   * Detaches a callback previously attached with on().
   *
   * Detach a callback previously attached with on(). Note that if on() was called multiple times
   * with the same eventType and callback, the callback will be called multiple times for each event,
   * and off() must be called multiple times to remove the callback. Calling off() on a parent listener
   * will not automatically remove listeners registered on child nodes, off() must also be called on any
   * child listeners to remove the callback.
   *
   * If a callback is not specified, all callbacks for the specified eventType will be removed. Similarly,
   * if no eventType or callback is specified, all callbacks for the Reference will be removed.
   */
  off: import('@firebase/database-types').Query['off'];

  /**
   * **on**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#on),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#on),
   * [~rest~]() ]
   *
   * Listens for data changes at a particular location (or query).
   *
   * This is the primary way to read data from a Database. Your callback will be triggered for
   * the initial data and again whenever the data changes. Use `off()` to stop receiving updates.
   */
  on: import('@firebase/database-types').Query['on'];

  /**
   * **once**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#once),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#once),
   * [~rest~]() ]
   *
   * Listens for exactly one event of the specified event type, and then stops listening.
   */
  once: import('@firebase/database-types').Query['once'];

  /**
   * **orderByChild**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#orderbychild),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#orderby) ]
   *
   * Generates a new Query object ordered by the specified child key.
   *
   * Queries can only order by one key at a time. Calling orderByChild() multiple times on the same
   * query is an error.
   *
   * Firebase queries allow you to order your data by any child key on the fly. However, if you know
   * in advance what your indexes will be, you can define them via the `.indexOn` rule in your Security
   * Rules for better performance.
   */
  orderByChild: import('@firebase/database-types').Query['orderByChild'];

  /**
   * **orderByKey**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#orderbykey),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#orderby=key) ]
   *
   * Generates a new Query object ordered by key. Sorts the results of a query by their (ascending)
   * key values.
   */
  orderByKey: import('@firebase/database-types').Query['orderByKey'];

  /**
   * **orderByValue**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#orderbyvalue),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#orderby=value) ]
   *
   * Generates a new Query object ordered by value. If the children of a query are all scalar values
   * (string, number, or boolean), you can order the results by their (ascending) values.
   */
  orderByValue: import('@firebase/database-types').Query['orderByValue'];

  /**
   * **startAt**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.Query#startat),
   * [rest](https://firebase.google.com/docs/database/rest/retrieve-data#orderby=value) ]
   *
   * Creates a Query with the specified starting point.
   *
   * Using startAt(), endAt(), and equalTo() allows you to choose arbitrary starting and ending
   * points for your queries.
   *
   * The starting point is inclusive, so children with exactly the specified value will be included
   * in the query. The optional key argument can be used to further limit the range of the query.
   * If it is specified, then children that have exactly the specified value must also have a key
   * name greater than or equal to the specified key.
   */
  startAt: import('@firebase/database-types').Query['startAt'];
}
