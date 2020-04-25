[![Build Status](https://travis-ci.org/forest-fre/abstracted-client.svg?branch=master)](https://travis-ci.org/forest-fre/abstracted-client.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/forest-fre/abstracted-client/badge.svg?branch=master)](https://coveralls.io/github/forest-fre/abstracted-client?branch=master)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

![ ](./docs/images/abstracted-client.jpg)

> A minimal abstraction over the Firebase client API

## Basic Usage

Meant for frontend Javascript/Typescript apps which interact with Firebase's client API using the firebase client api.

```ts
import DB, { IFirebaseConfig } from "abstracted-client";
const config: IFirebaseClientConfig = {
  apiKey: "ATzaSyDuimhvBmcV1zeTl4m1MphOgWnzS16QhBM",
  authDomain: "my-app.firebaseapp.com",
  databaseURL: "https://my-app.firebaseio.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
  messagingSenderId: "999999999999"
};
const db = new DB({ config });
// Get a list of records
const users = await db.getValue<IUser[]>("users");
// Push a new value onto a list
const company: ICompany = {
  name: "Acme",
  employees: 500
};
db.push<ICompany>("/companies", company);
```

### Authentication

All of the authentication is done via the normal [Firebase API for Auth](https://firebase.google.com/docs/reference/js/firebase.auth) which is accessible as `auth` off the DB class:

```ts
const db = new DB({ config });
const auth = db.auth;
```

### Mocking

This library supports simple redirecting of all operations to the `firemock` mocking library; see [related projects](docs/related.md)) and the ["Mocking" section](docs/mocking.md) of the docs here for more details. In cases where mocking is being used, authentication (and security rights for paths) are not supported and therefore the above ENV variables are not required.

## Documentation

Since this library and **abstracted-admin** share a common implementation for most of their API surface you'll find the documentation here:
[abstracted-admin](https://forest-fire.gitbooks.io/abstracted-client/content/)
