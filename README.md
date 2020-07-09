# Forest Fire Monorepo for Firebase

This repo contains two packages that will be of the main interest of consumers:

- `universal-fire` - provides all exports needed to interact with both Firestore and the Real Time Database via both the Admin and Client SDKs
- `firemock` - provides an in-memory mock database that mimics the real-time databaase (it will eventually do Firestore too) as well as the providing Firebase Auth mocking

The remaining repos are _namespaced_ under the `@forest-fire` organizational unit.

Documentation for this repo can be found at:

- [https://universal-fire.net](https://universal-fire.net)

## Packages structure

The `package.json` files in each _package_ in the `./packages` directory defines the **npm** package name but it makes sense to have as much similarity as possible however sometimes there are reasons where we deviate from this. For instance:

- `serialized-query` - 