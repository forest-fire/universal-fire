import { FireModel, List, Model, Record, model, property } from 'firemodel';
import { IDatabaseSdk, RealTimeAdmin } from 'universal-fire';

import { FancyPerson } from './testing/FancyPerson';
import { Mock } from '~/Mock';
import { Car } from './testing/Car';

@model({})
export class SimplePerson extends Model {
  @property public name: string;
  @property public age: number;
  @property public phoneNumber: string;
}

describe('Mocking:', () => {
  let db: IDatabaseSdk;
  let realDb: IDatabaseSdk;
  beforeAll(async () => {
    // TODO: check why "realDb" is a mock DB
    realDb = await RealTimeAdmin.connect({ mocking: true });
  });
  afterAll(async () => {
    const fancy = Record.create(FancyPerson);
    try {
      await realDb.remove(fancy.dbOffset);
    } catch (e) {
      console.log(`Got error in cleanup: `, e.message);
    }
  });
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it('the auto-mock works for named properties', async () => {
    const simplePeople = (await Mock(SimplePerson).generate(10)).map(
      (s) => s.data
    );
    expect(simplePeople).toHaveLength(10);

    simplePeople.map((person) => {
      expect(typeof person.age).toBe('number');
      expect(person.age).toBeGreaterThan(0);
      expect(person.age).toBeLessThan(101);
      return person;
    });
  });

  it('giving a @mock named hint corrects the typing of a named prop', async () => {
    const fancyPeople = (await Mock(FancyPerson).generate(10)).map(
      (s) => s.data
    );
    expect(fancyPeople).toHaveLength(10);

    expect(fancyPeople).toHaveLength(10);
    fancyPeople.map((person) => {
      expect(typeof person.otherPhone).toEqual('string');
      expect(/[\\.\\(-]/.test(person.otherPhone)).toBe(true);
    });
  });

  it('passing in a function to @mock produces expected results', async () => {
    const fancyPeople = (await Mock(FancyPerson).generate(10)).map(
      (s) => s.data
    );
    const people = await List.all(Car);
    expect(fancyPeople).toHaveLength(10);
    expect(fancyPeople).toHaveLength(10);
    fancyPeople.map((person) => {
      expect(typeof person.foobar).toEqual('string');
      expect(person.foobar).toContain('hello');
    });
  });

  it('using createRelationshipLinks() sets fake links to all relns', async () => {
    const numberOfFolks = 2;

    const people = (
      await Mock(FancyPerson).createRelationshipLinks().generate(numberOfFolks)
    ).map((d) => d.data);

    expect(people).toHaveLength(numberOfFolks);

    people.map((person) => {
      expect(typeof person.employer).toEqual('string');
      expect(typeof person.cars).toEqual('object');
    });
  });

  it('using followRelationshipLinks() sets links and adds those models', async () => {
    const numberOfFolks = 10;
    const mockData = await Mock(FancyPerson)
      .followRelationshipLinks()
      .generate(numberOfFolks);

    const people = mockData
      .filter((m) => m.modelName === 'fancyPerson')
      .map((d) => d.data);
    const cars = mockData.filter((m) => m.modelName === 'car').map((d) => d.data);
    const company = mockData
      .filter((m) => m.modelName === 'company')
      .map((d) => d.data);

    expect(cars.length).toBe(numberOfFolks * 2);
    expect(company.length).toBe(numberOfFolks);
    expect(people).toHaveLength(numberOfFolks * 5);

    const carIds = cars.map((car) => car.id);
    carIds.map((id) => people.filter((i) => i.id === id));

    const companyIds = company.map((c) => c.id);
    companyIds.map((id) => people.filter((i) => i.id === id));
  });

  it('using a specific config for createRelationshipLinks works as expected', async () => {
    const numberOfFolks = 25;
    await Mock(FancyPerson)
      .followRelationshipLinks({
        cars: [3, 5],
      })
      .generate(numberOfFolks);
    const people = await List.all(FancyPerson);

    expect(people).toHaveLength(numberOfFolks);
  }, 15000);
});
