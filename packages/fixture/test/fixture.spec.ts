/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
import { firstProp, lastProp, createDatabase } from 'firemock';
import { first } from 'native-dash';
import { SchemaCallback } from '~/@types';
import { Fixture } from '~/Fixture';
import { SchemaHelper } from '~/schema-helper';

const employeeMocker: SchemaCallback = (h: SchemaHelper) => ({
  first: h.faker.name.firstName(),
  last: h.faker.name.lastName(),
  company: h.faker.company.companyName(),
});

describe('Mock class()', () => {
  it('Mock a Schema API structured correctly', async () => {
    const m = Fixture.prepare();
    const schemaApi = m.addSchema('foo');
    expect(typeof schemaApi.mock).toEqual('function');
    expect(typeof schemaApi.belongsTo).toEqual('function');
    expect(typeof schemaApi.hasMany).toEqual('function');
    expect(typeof schemaApi.pluralName).toEqual('function');
  });

  it('Mock → Deployment API structured correctly', async () => {
    const m = await Fixture.prepare();
    m.addSchema('foo').mock(() => 'testing');
    const deployApi = m.deploy.queueSchema('foo');

    expect(typeof deployApi.queueSchema).toEqual('function');
    expect(typeof deployApi.quantifyHasMany).toEqual('function');
    expect(typeof deployApi.fulfillBelongsTo).toEqual('function');
    expect(typeof deployApi.generate).toEqual('function');
  });

  describe('Building and basic config of database', () => {
    it('Sending in raw data to constructor allows manual setting of database state', async () => {
      const m = createDatabase(
        'RealTimeAdmin',
        {},
        {
          monkeys: {
            a: { name: 'abbey' },
            b: { name: 'bobby' },
            c: { name: 'cindy' },
          },
        }
      );

      expect(typeof m.store.state.monkeys).toEqual('object');
      expect(m.store.state.monkeys.a.name).toBe('abbey');
      const result = await m.db.ref('/monkeys').once('value');
      expect(result.numChildren()).toBe(3);
    });

    it('Adding a call to updateDB() allows additional state in conjunction with API additions', async () => {
      const f = Fixture.prepare();
      f.addSchema('owner').mock((h) => () => ({
        name: h.faker.name.firstName(),
      }));
      const fixture = f.deploy.queueSchema('owner', 10).generate();
      const m = createDatabase('RealTimeAdmin', {}, fixture);

      m.store.updateDb('/', {
        monkeys: {
          a: { name: 'abbey' },
          b: { name: 'bobby' },
          c: { name: 'cindy' },
        },
      });

      expect(m.store.state.monkeys).toBeInstanceOf(Object);
      expect(m.store.state.owners).toBeInstanceOf(Object);
      expect(m.store.state.monkeys.a.name).toBe('abbey');
      const monkeys = await m.db.ref('/monkeys').once('value');
      expect(monkeys.numChildren()).toBe(3);

      const owners = await m.db.ref('/owners').once('value');
      expect(owners.numChildren()).toBe(10);
    });

    it('Simple mock-to-generate populates DB correctly', async () => {
      const f = Fixture.prepare();
      f.addSchema('foo').mock((h: SchemaHelper) => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      const fixtures = f.deploy.queueSchema('foo', 5).generate();
      const m = createDatabase('RealTimeClient', {}, fixtures);
      const listOfFoos = m.store.state.fooes;
      const keys = Object.keys(listOfFoos);
      const firstFoo = listOfFoos[first(keys)];

      expect(typeof listOfFoos).toEqual('object');
      expect(typeof firstFoo.first).toEqual('string');
      expect(typeof firstFoo.last).toEqual('string');
      expect(keys.length).toBe(5);
    });

    it("using pluralName() modifier changes a schema's database path", async () => {
      const f = Fixture.prepare();
      f.addSchema('foo')
        .mock(() => ({ result: 'result' }))
        .pluralName('fooie')
        .addSchema('company') // built-in exception
        .mock(() => 'ignored')
        .addSchema('fungus') // rule trigger
        .mock(() => 'ignored');
      const fixture = f.deploy
        .queueSchema('foo')
        .queueSchema('company')
        .queueSchema('fungus')
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixture);

      expect(m.store.state.foos).toBeUndefined();
      expect(m.store.state.fooie).toBeInstanceOf(Object);
      expect(firstProp(m.store.state.fooie).result).toBe('result');
      expect(m.store.state.companies).toBeInstanceOf(Object);
      expect(m.store.state.fungi).toBeInstanceOf(Object);
    });

    it('using modelName() modifier changes db path appropriately', async () => {
      const f = await Fixture.prepare();
      f.addSchema('foo')
        .mock(() => ({ result: 'result' }))
        .modelName('car');
      const fixtures = f.deploy.queueSchema('foo').generate();
      const m = createDatabase('RealTimeClient', {}, fixtures);

      expect(m.store.state.foos).toBeUndefined();
      expect(m.store.state.cars).toBeInstanceOf(Object);

      expect(firstProp(m.store.state.cars).result).toBe('result');
    });

    it('using pathPrefix the generated data is appropriately offset', async () => {
      const f = Fixture.prepare();
      f.addSchema('car')
        .mock(() => ({ result: 'result' }))
        .pathPrefix('authenticated');
      const fixtures = f.deploy.queueSchema('car', 10).generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(m.store.state.authenticated).toBeInstanceOf(Object);
    });

    it('Mocking function that returns a scalar works as intended', async () => {
      const f = Fixture.prepare();
      f.addSchema('number', (h) =>
        h.faker.datatype.number({ min: 0, max: 1000 })
      );
      f.addSchema('string', (h) => h.faker.random.words(3));
      f.queueSchema('number', 10);
      f.queueSchema('string', 10);
      const fixture = f.generate();
      const m = createDatabase('RealTimeAdmin', {}, fixture);

      expect(typeof firstProp(m.store.state.strings)).toEqual('string');
      expect(typeof lastProp(m.store.state.strings)).toEqual('string');
      expect(typeof firstProp(m.store.state.numbers)).toEqual('number');
      expect(typeof lastProp(m.store.state.numbers)).toEqual('number');
    });
  });

  describe('Relationships', () => {
    it('Adding belongsTo relationship adds FK property with empty value', async () => {
      const f = Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      const fixtures = f.queueSchema('user').generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.users)).toHaveProperty('companyId');
      expect(firstProp(m.store.state.users).companyId).toBe('');
    });

    it('Adding belongsTo relationship adds fulfilled shadow FK property when external schema not present', async () => {
      const f = Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      const fixtures = f.deploy
        .queueSchema('user', 2)
        .fulfillBelongsTo('company')
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.users)).toHaveProperty('companyId');
      expect(lastProp(m.store.state.users)).toHaveProperty('companyId');
      expect(typeof firstProp(m.store.state.users).companyId).toBe('string');
      expect(firstProp(m.store.state.users).companyId.slice(0, 1)).toBe('-');
      expect(firstProp(m.store.state.users).companyId).not.toBe(
        lastProp(m.store.state.users).companyId
      );
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when external schema is present but not deployed', async () => {
      const f = Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      f.addSchema('company').mock((h: SchemaHelper) => {
        return { companyName: h.faker.company.companyName() };
      });
      const fixture = f.deploy
        .queueSchema('user', 2)
        .fulfillBelongsTo('company')
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixture);

      expect(firstProp(m.store.state.users)).toHaveProperty('companyId');
      expect(typeof firstProp(m.store.state.users).companyId).toBe('string');
      expect(firstProp(m.store.state.users).companyId.slice(0, 1)).toBe('-');
      const companyFK = firstProp(m.store.state.users).companyId;
      const companyIds = Object.keys(m.store.state.companies);
      expect(companyIds.indexOf(companyFK)).not.toBe(-1);
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when available in DB', async () => {
      const f = Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      f.addSchema('company').mock((h: SchemaHelper) => {
        return { companyName: h.faker.company.companyName() };
      });
      const fixtures = f.deploy
        .queueSchema('user', 2)
        .fulfillBelongsTo('company')
        .queueSchema('company', 10)
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      const firstCompanyId = firstProp(m.store.state.users).companyId;
      const companyIds = Object.keys(m.store.state.companies);
      expect(firstProp(m.store.state.users)).toHaveProperty('companyId');
      expect(typeof firstCompanyId).toBe('string');
      expect(firstCompanyId.slice(0, 1)).toBe('-');
      expect(companyIds.indexOf(firstCompanyId)).not.toBe(-1);
    });

    it('Adding hasMany relationship does not add FK property without quantifyHasMany()', async () => {
      const f = Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      const fixtures = f.deploy.queueSchema('company').generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.companies).employees).toBeUndefined();
    });

    it('Adding hasMany with quantifyHasMany() produces ghost references when FK reference is not a defined schema', async () => {
      const f = Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      const fixtures = f.deploy
        .queueSchema('company')
        .quantifyHasMany('employee', 10)
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.companies).employees).toBeInstanceOf(
        Object
      );
      expect(
        Object.keys(firstProp(m.store.state.companies).employees).length
      ).toBe(10);
      expect(m.store.state.employees).not.toBeInstanceOf(Object);
    });

    it('Adding hasMany with quantifyHasMany() produces real references when FK reference is a defined schema', async () => {
      const f = Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      const fixtures = f.deploy
        .queueSchema('company')
        .quantifyHasMany('employee', 10)
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.companies).employees).toBeInstanceOf(
        Object
      );
      expect(
        Object.keys(firstProp(m.store.state.companies).employees).length
      ).toBe(10);
      expect(m.store.state.employees).toBeDefined();
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      f.deploy
        .queueSchema('employee', 25)
        .queueSchema('company')
        .quantifyHasMany('employee', 10);
      const fixtures = f.deploy.generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      const company = firstProp(m.store.state.companies);
      expect(company.employees).toBeInstanceOf(Object);
      expect(Object.keys(company.employees).length).toBe(10);
      expect(m.store.state.employees).toBeDefined();
      expect(Object.keys(m.store.state.employees).length).toBe(25);
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist, adds more when runs out', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      const fixtures = f.deploy
        .queueSchema('employee', 5)
        .queueSchema('company')
        .quantifyHasMany('employee', 10)
        .generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(firstProp(m.store.state.companies).employees).toBeInstanceOf(
        Object
      );
      expect(
        Object.keys(firstProp(m.store.state.companies).employees).length
      ).toBe(10);
      expect(m.store.state.employees).toBeDefined();
      expect(Object.keys(m.store.state.employees).length).toBe(10);
    });

    it('Mock can generate more than once', async () => {
      const f = Fixture.prepare();
      f.addSchema('employee', employeeMocker);
      f.queueSchema('employee', 10);
      const fixtures = f.generate();
      const m = createDatabase('RealTimeAdmin', {}, fixtures);

      expect(Object.keys(m.store.state.employees)).toHaveLength(10);
      f.queueSchema('employee', 5);
      const more = f.generate();
      console.log({ length: Object.keys((more as any).employees).length });
      m.store.mergeDb('/', more);
      expect(Object.keys(m.store.state.employees)).toHaveLength(15);
    });
  });
});
