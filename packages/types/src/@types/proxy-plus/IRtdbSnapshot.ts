type _IRtdbSnapshot_ = import('@firebase/database-types').DataSnapshot;

export interface IRtdbSnapshot extends _IRtdbSnapshot_ {
  /**
   * **set**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#child),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#child)
   * [~rest~]() ]
   *
   * Gets another DataSnapshot for the location at the specified relative path.
   *
   * Passing a relative path to the child() method of a DataSnapshot returns
   * another DataSnapshot for the location at the specified relative path. The
   * relative path can either be a simple child name (for example, "ada") or a
   * deeper, slash-separated path (for example, "ada/name/first"). If the child
   * location has no data, an empty DataSnapshot (that is, a DataSnapshot whose
   * value is null) is returned.
   */
  child: import('@firebase/database-types').DataSnapshot['child'];

  /**
   * **exists**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#exists),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#exists
   * [~rest~]() ]
   *
   * Returns true if this DataSnapshot contains any data. It is slightly more efficient
   * than using snapshot.val() !== null.
   */
  exists: import('@firebase/database-types').DataSnapshot['exists'];

  /**
   * **exportVal**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#exportVal),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#exportVal
   * [~rest~]() ]
   *
   * Exports the entire contents of the DataSnapshot as a JavaScript object.
   *
   * The exportVal() method is similar to val(), except priority information is included
   * (if available), making it suitable for backing up your data.
   */
  exportVal: import('@firebase/database-types').DataSnapshot['exportVal'];

  /**
   * **forEach**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#forEach
   * [~rest~]() ]
   *
   * Enumerates the top-level children in the DataSnapshot.
   *
   * Because of the way JavaScript objects work, the ordering of data in the JavaScript object
   * returned by val() is not guaranteed to match the ordering on the server nor the ordering
   * of child_added events. That is where forEach() comes in handy. It guarantees the children
   * of a DataSnapshot will be iterated in their query order.
   */
  forEach: import('@firebase/database-types').DataSnapshot['forEach'];

  /**
   * **getPriority**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#getPriority),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#getPriority
   * [~rest~]() ]
   *
   */
  getPriority: import('@firebase/database-types').DataSnapshot['getPriority'];

  /**
   * **hasChild**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#hasChild),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#hasChild
   * [~rest~]() ]
   *
   * Returns true if the specified child path has (non-null) data.
   */
  hasChild: import('@firebase/database-types').DataSnapshot['hasChild'];

  /**
   * **hasChildren**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#hasChildren),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#hasChildren
   * [~rest~]() ]
   *
   * Returns whether or not the DataSnapshot has any non-null child properties.
   *
   * You can use hasChildren() to determine if a DataSnapshot has any children. If it
   * does, you can enumerate them using forEach(). If it doesn't, then either this
   * snapshot contains a primitive value (which can be retrieved with val()) or it
   * is empty (in which case, val() will return null).
   */
  hasChildren: import('@firebase/database-types').DataSnapshot['hasChildren'];

  /**
   * **key**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#key),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#key
   * [~rest~]() ]
   *
   * The key (last part of the path) of the location of this DataSnapshot.
   *
   * The last token in a Database location is considered its key. For example, "ada" is the key
   * for the /users/ada/ node. Accessing the key on any DataSnapshot will return the key for the
   * location that generated it. However, accessing the key on the root URL of a Database will
   * return null.
   */
  key: import('@firebase/database-types').DataSnapshot['key'];

  /**
   * **toJSON**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#toJSON),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#toJSON
   * [~rest~]() ]
   */
  toJSON: import('@firebase/database-types').DataSnapshot['toJSON'];

  /**
   * **val**
   * [ docs for
   * [client](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#val),
   * [admin](https://firebase.google.com/docs/reference/admin/node/admin.database.DataSnapshot#val
   * [~rest~]() ]
   *
   * Extracts a JavaScript value from a DataSnapshot.
   *
   * Depending on the data in a DataSnapshot, the val() method may return a scalar type
   * (string, number, or boolean), an array, or an object. It may also return `null`,
   * indicating that the DataSnapshot is empty (contains no data).
   */
  val: import('@firebase/database-types').DataSnapshot['val'];
}
