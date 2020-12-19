# Universal Fire Monorepo

> Note: a lot of this monorepo was guided by the great video instruction provided by Mike North in his **js-ts-monorepos** [course](https://frontendmasters.com/courses/monorepos) and [repo](https://github.com/mike-north/js-ts-monorepos/)

This is currently a work in progress with the following known action items:

### Baseline
- [ ] Watch full video series from Mike North
- [ ] Review all eslint errors/warnings (there are a lot more than tslint had)
- [ ] Add `api-extractor.json` files as suggested by Mike
- [ ] Find way -- i think using lerna -- to install all deps across repos; tried `lerna run 'yarn install'` but this didn't work
- [ ] Get the centrally located **build** script to work in this configuration
- [ ] Run tests on each individual repo to understand where we currently are

### Ready for Release
- [ ] Finish refactor of **firemock**
- [ ] Get all **firemock** tests passing
- [ ] Get all repo tests passing
- [ ] Release and take strong note of changelog features, hawk help/hinderence, identify improvements in process

### Firemodel
- [ ] Copy/paste in Firemodel source on a branch and integrate to monorepo
- [ ] Timebox effort and checkpoint on opinion on whether to integrate.
- [ ] Integrate repo and shutdown solo repo

### Vuex Plugin
- [ ] Copy/paste in Vuex plugin 
- [ ] Integrate repo and shutdown solo repo

### Eventually
- [ ] Look into Microsoft's [api-extractor-model](https://github.com/microsoft/rushstack/tree/master/apps/api-extractor-model)
- [ ] Look into [**Stream Collator**](https://www.npmjs.com/package/@rushstack/stream-collator) which promises to provide concurent execution with non-interleaved stdout
- [ ] Build a yeoman template (or some templating solution) to kick off a boilerplate monorepo going forward

## Structure


## Tooling

### Volta

The [Volta](https://volta.sh/) tool provides us with the means to _pin_ to a specific version of **Yarn** and **Node** on a per repo basis (this is actually on a _per package_ basis when we're talking about a monorepo). 

This control is super handy but it also let's us install npm packages globally in a way that let's us run `tsc` instead of `yarn tsc` because with Volta installed you are now ensured that if the repo you are in _has_ a version of the binary this repo version will be used and if it does not then it will fallback to the globally installed version. This in essence allows us the convenience of the shorter global commands, knowing we can "always" use them, but also being _pinned_ to the repo-specific version when there is a repo specific version.

### Opinionated Commits

We traditionally _did not_ have any strong opinions built into the git commits in this repo but in an effort to become more disciplined we are moving to a more "opinionated" view to help ensure consistency as well as leverage a set of tools that will work with these standards to lower our operational risks.

The main tooling consists of:

1. **commitlint** - provides a syntax engine for git commits, it's the engine not the rules itself.
2. [**@commitlint/config-conventional**](https://github.com/conventional-changelog/commitlint#readme) - leverages a common standard for repo commits
3. [**@commitlint/config-lerna-scope**](https://github.com/conventional-changelog/commitlint#readme) - allows our grammer to integrate more seemlessly with monorepos and lerna specically. This involves differnt aspects but focuses on _scoping_ a commit to a specific package: `feat(real-time-db): added some thing`, etc.
4. [**lerna-changelog**](https://github.com/lerna/lerna-changelog#readme) - provides a changelog for PR based integration ... need to understand this a bit more to ensure we have an optimal way of leveraging this strategy versus feature-branch merging

### API Documentation

> Note: we need to decide whether this is useful for us; it was brought in based on Mike North video series suggestion. I would think we DO want to use but not 100% sure.

Microsoft provides two packages that will help us document our public and private interfaces which this monorepo offers. They are part of the [Rush Stack](https://rushstack.io/). The two packages are:

1. [**@microsoft/api-extractor**](https://api-extractor.com/)
2. [**@microsoft/api-documentor**](https://github.com/microsoft/rushstack/tree/master/apps/api-documenter)- used to generate an online API reference manual for your TypeScript library. It reads the *.api.json data files produced by API Extractor, and then generates files in Markdown or DocFX format.

These two libraries are documented 
- leveraging Typescript, the extractor reports on accidental breaks, missing exports, public and private APIs, consolidation of `.d.ts` files, and online docs.