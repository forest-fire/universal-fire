type _IRtdbOnDisconnect_ = import('@firebase/database-types').OnDisconnect;

/**
 * **OnDisconnect** (_aliased as IRtdbOnDisconnect as part of `universal-fire`_)
 *
 * The `onDisconnect` class allows you to write or clear data when your client disconnects
 * from the Database server. These updates occur whether your client disconnects cleanly
 * or not, so you can rely on them to clean up data even if a connection is dropped or a
 * client crashes.
 *
 * The onDisconnect class is most commonly used to manage presence in applications where
 * it is useful to detect how many clients are connected and when other clients disconnect.
 * See [Enabling Offline Capabilities in JavaScript](https://firebase.google.com/docs/database/web/offline-capabilities)
 * for more information.
 *
 * To avoid problems when a connection is dropped before the requests can be transferred
 * to the Database server, these functions should be called before writing any data.
 *
 * > Note that `onDisconnect` operations are only triggered once. If you want an operation to
 * occur each time a disconnect occurs, you'll need to re-establish the onDisconnect operations
 * each time you reconnect.
 */
export interface IRtdbOnDisconnect extends _IRtdbOnDisconnect_ {
  /**
   * **cancel**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.OnDisconnect#cancel
   * [~rest~]() ]
   *
   * Cancels all previously queued onDisconnect() _set_ or _update_ events for this location and
   * all children.
   *
   * If a write has been queued for this location via a set() or update() at a parent location,
   * the write at this location will be canceled, though writes to sibling locations will still occur.
   */
  cancel: import('@firebase/database-types').OnDisconnect['cancel'];

  /**
   * **remove**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.OnDisconnect#remove
   * [~rest~]() ]
   *
   * Ensures the data at this location is deleted when the client is disconnected (due to closing
   * the browser, navigating to a new page, or network issues).
   */
  remove: import('@firebase/database-types').OnDisconnect['remove'];

  /**
   * **set**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.OnDisconnect#set
   * [~rest~]() ]
   *
   * Ensures the data at this location is set to the specified value when the client is disconnected
   * (due to closing the browser, navigating to a new page, or network issues).
   *
   * `set()` is especially useful for implementing "presence" systems, where a value should be changed
   * or cleared when a user disconnects so that they appear "offline" to other users. See Enabling
   * Offline Capabilities in JavaScript for more information.
   *
   * Note that onDisconnect operations are only triggered once. If you want an operation to occur
   * each time a disconnect occurs, you'll need to re-establish the onDisconnect operations each
   * time.
   */
  set: import('@firebase/database-types').OnDisconnect['set'];

  setWithPriority: import('@firebase/database-types').OnDisconnect['setWithPriority'];

  update: import('@firebase/database-types').OnDisconnect['update'];
}
