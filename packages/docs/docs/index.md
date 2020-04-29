# Universal Fire

> Abstracting Firebase's SDK's for the **client** and **admin** applications of both **Firestore** and the **Real-Time Database**

## Installing

Installing is as easy as:

```sh
# npm
npm install --save-dev universal-fire
# yarn
yarn add universal-fire
```

To use you will add something like the following to your code:

```typescript
import { DB, RealTimeClient, FirestoreAdmin } from 'universal-fire';
// use the real-time database with the Client SDK
const db = DB.connect(RealTimeClient, config);
// use the firestore database with the Admin SDK
const db = DB.connect(FirestoreAdmin, config);
```

## What is Universal Fire?

The original Firebase database -- the "real-time database" -- was an awesome database for getting started fast and _could be_ an awesome database for big projects too. The API is decently documented and the API is "ok" but it can also be somewhat awkward and due to it's lack of opinion, it could lead the inexperienced down non-performant paths.

Universal Fire -- or as it was known until recently as "abstracted-firebase" -- was intended to provide a nicer API surface and reinforce best practices with some opinion. However, since Firebase now has a newer database called Firestore, we also wanted to include this same API surface to both databases and make operating with either very much the same.

As it turned out, this was made easier because Firestore actually followed similar conventions (or at least aligned conventions) to what was already in place. Today, Universal Fire provides the following benefits to developers:

1. **Consistent API.** A 100% consistent way to use 95% of the functionality between the Admin and Client SDK's across BOTH databases. For the last 5% (which varies between client and admin or possibly Firestore/RTDB), the functionality is exposed as well. 
2. **Simple Migration.** Should you want to move from one database to the other, the abstraction of the API means that changing from one database to the other is ideally just one line of code!
3. **Simple Learning Curve.** Everything in Universal Fire is fully typed with Typescript and effort has been made to expose understandable comments (which you get via intellisense) along with sensible and descriptive error messages. And then there is this documentation too as a topper.
4. **Eco-System.** Universal Fire is cool by itself but it's attached to an ecosystem that will greatly expand what you can do when using a Firebase database in the backend. This ecosystem includes:

  - **Firemock** - an in-memory database that mocks a real Firebase database. Great for development and testing where fast performance as well as being able to reset your data to a know state can be highly adventagous.
  - **[`Firemodel`](https://firemodel.info/)** - a data modeling layer that allows you to structure you data in a strongly typed manner while lowering the friction in interacting with the database to incredibly low levels.
  - **[Vuex Plugin](https://vuex.firemodel.info)** - if you're using VueJS as an SPA, and more specifically Vuex as a client state management framework, we have a plugin to Firemodel that further reduces friction while also making extremely performant caching (with Vuex, IndexedDB, and Firebase) super easy.

Hopefully what you've heard so far sounds interesting, please check out the remaining docs for more examples and instruction and please let us know if you run into issues (github issues) or better yet help us fix things you find broken with pull requests.


