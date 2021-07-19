/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
import * as helpers from './testing/helpers';
import { Fixture, SchemaHelper, SchemaCallback } from '@forest-fire/fixture';
import { createDatabase } from '~/databases';
import { SDK } from '~/auth/admin-sdk';
import { first } from 'native-dash';
import { firstProp, lastProp } from '~/util';

const employeeMocker: SchemaCallback = (h: SchemaHelper) => () => ({
  first: h.faker.name.firstName(),
  last: h.faker.name.lastName(),
  company: h.faker.company.companyName(),
});

describe('Mock class()', () => {



  it('Mock a Schema API structured correctly', async () => {
    const m = await Fixture.prepare();
    const schemaApi = m.addSchema('foo');
    expect(schemaApi.mock).toBeFunction();
    expect(schemaApi.belongsTo).toBeFunction();
    expect(schemaApi.hasMany).toBeFunction();
    expect(schemaApi.pluralName).toBeFunction();
  });

  it('Mock → Deployment API structured correctly', async () => {
    const m = await Fixture.prepare();
    m.addSchema('foo').mock(() => () => 'testing');
    const deployApi = m.deploy.queueSchema('foo');

    expect(deployApi.queueSchema).toBeFunction();
    expect(deployApi.quantifyHasMany).toBeFunction();
    expect(deployApi.fulfillBelongsTo).toBeFunction();
    expect(deployApi.generate).toBeFunction();
  });

  describe('Building and basic config of database', () => {
    it('Sending in raw data to constructor allows manual setting of database state', async () => {
      const m = createDatabase(SDK.RealTimeAdmin, {}, {
        db: {
          monkeys: {
            a: { name: 'abbey' },
            b: { name: 'bobby' },
            c: { name: 'cindy' },
          },
        },
      });

      expect(m.store.getDb().monkeys).toBeInstanceOf(Object);
      expect(m.store.getDb().monkeys.a.name).toBe('abbey');
      const result = await m.db.ref('/monkeys').once('value');
      expect(result.numChildren()).toBe(3);
    });

    it('Adding a call to updateDB() allows additional state in conjunction with API additions', async () => {
      const f = await Fixture.prepare();
      f.addSchema('owner').mock((h) => () => ({
        name: h.faker.name.firstName(),
      }));
      const fixture = f.deploy.queueSchema('owner', 10).generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      m.store.updateDb("/", {
        monkeys: {
          a: { name: 'abbey' },
          b: { name: 'bobby' },
          c: { name: 'cindy' },
        },
      });

      expect(m.store.getDb().monkeys).toBeInstanceOf(Object);
      expect(m.store.getDb().owners).toBeInstanceOf(Object);
      expect(m.store.getDb().monkeys.a.name).toBe('abbey');
      const monkeys = await m.db.ref('/monkeys').once('value');
      expect(monkeys.numChildren()).toBe(3);

      const owners = await m.db.ref('/owners').once('value');
      expect(owners.numChildren()).toBe(10);
    });

    it('Simple mock-to-generate populates DB correctly', async () => {
      const f = await Fixture.prepare();
      f.addSchema('foo').mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      const fixtures = f.deploy.queueSchema('foo', 5).generate();
      const m = createDatabase(SDK.RealTimeClient, {}, fixtures);

      const listOfFoos = m.store.getDb().foos;
      const keys = Object.keys(listOfFoos);
      const firstFoo = listOfFoos[first(keys)];

      expect(listOfFoos).toBeInstanceOf(Object);
      expect(firstFoo.first).toBeString();
      expect(firstFoo.last).toBeString();
      expect(keys.length).toBe(5);
    });

    it("using pluralName() modifier changes a schema's database path", async () => {
      const f = await Fixture.prepare();
      f.addSchema('foo')
        .mock(() => () => ({ result: 'result' }))
        .pluralName('fooie')
        .addSchema('company') // built-in exception
        .mock(() => () => 'ignored')
        .addSchema('fungus') // rule trigger
        .mock(() => () => 'ignored');
      const fixture = f.deploy
        .queueSchema('foo')
        .queueSchema('company')
        .queueSchema('fungus')
        .generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      expect(m.store.getDb().foos).toBeUndefined();
      expect(m.store.getDb().fooie).toBeInstanceOf(Object);
      expect(firstProp(m.store.getDb().fooie).result).toBe('result');
      expect(m.store.getDb().companies).toBeInstanceOf(Object);
      expect(m.store.getDb().fungi).toBeInstanceOf(Object);
    });

    it('using modelName() modifier changes db path appropriately', async () => {
      const f = await Fixture.prepare();
      f.addSchema('foo')
        .mock(() => () => ({ result: 'result' }))
        .modelName('car');
      const fixtures = f.deploy.queueSchema('foo').generate();
      const m = createDatabase(SDK.RealTimeClient, {}, fixtures);

      expect(m.store.getDb().foos).toBeUndefined();
      expect(m.store.getDb().cars).toBeInstanceOf(Object);

      expect(firstProp(m.store.getDb().cars).result).toBe('result');
    });

    it('using pathPrefix the generated data is appropriately offset', async () => {
      const f = await Fixture.prepare();
      f.addSchema('car')
        .mock(() => () => ({ result: 'result' }))
        .pathPrefix('authenticated');
      const fixtures = f.deploy.queueSchema('car', 10).generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      expect(m.store.getDb().authenticated).toBeInstanceOf(Object);
    });

    it('Mocking function that returns a scalar works as intended', async () => {
      const f
        = await Fixture.prepare();
      f.addSchema('number', (h) => async () => h.faker.datatype.number({ min: 0, max: 1000 })
      );
      f.addSchema('string', (h) => async () => h.faker.random.words(3));
      f.queueSchema('number', 10);
      f.queueSchema('string', 10);
      const fixture = f.generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      expect(firstProp(m.store.getDb().strings)).toBeString();
      expect(lastProp(m.store.getDb().strings)).toBeString();
      expect(firstProp(m.store.getDb().numbers)).toBeNumber();
      expect(lastProp(m.store.getDb().numbers)).toBeNumber();
    });
  });

  describe('Relationships', () => {
    it('Adding belongsTo relationship adds FK property with empty value', async () => {
      const f = await Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      const fixtures = f.queueSchema('user').generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      expect(firstProp(m.store.getDb().users)).toHaveProperty('companyId');
      expect(firstProp(m.store.getDb().users).companyId).toBe('');
    });

    it('Adding belongsTo relationship adds fulfilled shadow FK property when external schema not present', async () => {
      const f = await Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      const fixtures = f.deploy.queueSchema('user', 2).fulfillBelongsTo('company').generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      expect(firstProp(m.store.getDb().users)).toHaveProperty('companyId');
      expect(lastProp(m.store.getDb().users)).toHaveProperty('companyId');
      expect(firstProp(m.store.getDb().users).companyId).toBeString();
      expect(firstProp(m.store.getDb().users).companyId.slice(0, 1)).toBe('-');
      expect(firstProp(m.store.getDb().users).companyId).not.toBe(
        lastProp(m.store.getDb().users).companyId
      );
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when external schema is present but not deployed', async () => {
      const f = await Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      f.addSchema('company').mock((h: SchemaHelper) => () => {
        return { companyName: h.faker.company.companyName() };
      });
      const fixture = f.deploy.queueSchema('user', 2).fulfillBelongsTo('company').generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixture);

      expect(firstProp(m.store.getDb().users)).toHaveProperty('companyId');
      expect(firstProp(m.store.getDb().users).companyId).toBeString();
      expect(firstProp(m.store.getDb().users).companyId.slice(0, 1)).toBe('-');
      const companyFK = firstProp(m.store.getDb().users).companyId;
      const companyIds = Object.keys(m.store.getDb().companies);
      expect(companyIds.indexOf(companyFK)).not.toBe(-1);
    });

    it('Adding belongsTo relationship adds fulfilled real FK property when available in DB', async () => {
      const f = await Fixture.prepare();
      f.addSchema('user')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo('company');
      f.addSchema('company').mock((h: SchemaHelper) => () => {
        return { companyName: h.faker.company.companyName() };
      });
      const fixtures = f.deploy
        .queueSchema('user', 2)
        .fulfillBelongsTo('company')
        .queueSchema('company', 10)
        .generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      const firstCompanyId = firstProp(m.store.getDb().users).companyId;
      const companyIds = Object.keys(m.store.getDb().companies);
      expect(firstProp(m.store.getDb().users)).toHaveProperty('companyId');
      expect(firstCompanyId).toBeString();
      expect(firstCompanyId.slice(0, 1)).toBe('-');
      expect(companyIds.indexOf(firstCompanyId)).not.toBe(-1);
    });

    it('Adding hasMany relationship does not add FK property without quantifyHasMany()', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      const fixtures = f.deploy.queueSchema('company').generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      expect(firstProp(m.store.getDb().companies).employees).toBeUndefined();
    });

    it('Adding hasMany with quantifyHasMany() produces ghost references when FK reference is not a defined schema', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      const fixtures = f.deploy
        .queueSchema('company')
        .quantifyHasMany('employee', 10)
        .generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);


      expect(firstProp(m.store.getDb().companies).employees).toBeInstanceOf(Object);
      expect(Object.keys(firstProp(m.store.getDb().companies).employees).length).toBe(10);
      expect(m.store.getDb().employees).not.toBeInstanceOf(Object);
    });

    it('Adding hasMany with quantifyHasMany() produces real references when FK reference is a defined schema', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName(),
        };
      });
      const fixtures = f.deploy
        .queueSchema('company')
        .quantifyHasMany('employee', 10)
        .generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);


      expect(firstProp(m.store.getDb().companies).employees).toBeInstanceOf(Object);
      expect(Object.keys(firstProp(m.store.getDb().companies).employees).length).toBe(10);
      expect(m.store.getDb().employees).toBeDefined();
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => () => {
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
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);


      const company = firstProp(m.store.getDb().companies);
      expect(company.employees).toBeInstanceOf(Object);
      expect(Object.keys(company.employees).length).toBe(10);
      expect(m.store.getDb().employees).toBeDefined();
      expect(Object.keys(m.store.getDb().employees).length).toBe(25);
    });

    it('Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist, adds more when runs out', async () => {
      const f = await Fixture.prepare();
      f.addSchema('company')
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany('employee');
      f.addSchema('employee').mock((h: SchemaHelper) => () => {
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
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);


      expect(firstProp(m.store.getDb().companies).employees).toBeInstanceOf(Object);
      expect(Object.keys(firstProp(m.store.getDb().companies).employees).length).toBe(10);
      expect(m.store.getDb().employees).toBeDefined();
      expect(Object.keys(m.store.getDb().employees).length).toBe(10);
    });

    it('Mock can generate more than once', async () => {
      const f = await Fixture.prepare();
      f.addSchema('employee', employeeMocker);
      f.queueSchema('employee', 10);
      const fixtures = f.generate();
      const m = createDatabase(SDK.RealTimeAdmin, {}, fixtures);

      expect(helpers.length(m.store.getDb().employees)).toBe(10);
      f.queueSchema('employee', 5);
      const more = f.generate();
      m.store.pushDb("/", more);
      expect(helpers.length(m.store.getDb().employees)).toBe(15);
    });
  });
});
