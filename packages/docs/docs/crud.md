---
prev: /getting-started.html
next: /query.html
---
# CRUD Operations

We are going to cover the basic CRUD (Create, Read, Update, and Delete) operations in this section but bear in mind we'll cover READ only terms of reading a single path in the database (which is a completely valid way of reading and typically done when you want a _single_ record). For reading multiple "records" you will want to do a Query and that is covered in the next section.

## Read

### getSnapshot( _path_ )

  Shorthand for `once('value')` which returns a Firebase snapshot:

  ```typescript
  const db = DB.connect( config );
  const snapshot = await db.getSnapshot('/users/-Kp23423ddkf');
  ```

  You can use the async/await style syntax, or if you prefer just the more traditional Promise-based *thenable* syntax.

### getValue( _path_ )

  Similar to `getSnapshot()` but the snapshot's *value* is returned instead of the snapshot:

  ```typescript
  const db = DB.connect( config );
  const user = await db.getValue<User>('/users/-Kp23423ddkf');
  console.log(user); // => { "-Kp23423ddkf": { name: "Bob Barker", ... } }
  ```

### getRecord( _path_ )

  This takes the `getValue()` method one step closer and starts to introduce the value of Typescript's generic types. In the example below 

  ```typescript
  const db = new DB();
  const user = await db.getRecord<User>('/users/-Kp23423ddkf');
  console.log(user); // => { id: "-Kp23423ddkf", name: "Bob Barker", ... }
  getList(path, [idProp])
  ```

### getList( _path_ )
  
  takes both the snapshot's val() and key and combines into a JS Object where the "key" is now expressed as an `id` property on the object:

  ```typescript
  const db = new DB();
  const users = await db.getList<IUser>('/users');
  console.log(user); // => [ {id: '-Kp23423ddkf', name: 'John' }, {...}, {...} ]
  ```

  > Note: if you prefer the property to be something that other you can state it as part of the optional "options" parameter `db.getList('/users', {  } );`


## Create

Creating new data in Firebase is achieved with the `add` or `set` commands:

### `add( path, value )`

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### `set( path, value )`

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Update

### `update (path, value)`
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### `multiPathSet( object )`

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Delete

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Back to the Future

If you find yourself wanting the exising Firebase SDK at your disposal for some reason, you can revert back to that API by use of the `ref()` function:

### ref( _path_ )

  An example usage might be:

  ```typescript
  const db = DB.connect( config );
  const ref = await db.ref('/users/-Kp23423ddkf');
  ```