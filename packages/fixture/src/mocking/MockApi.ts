import { IMockRelationshipConfig, IMockResponse } from './';
import { addRelationships, mockProperties } from './index';
import { FmModelConstructor,IModel,Model,Record } from 'firemodel';
import { IDictionary } from 'common-types';
import { IDatabaseSdk, ISdk } from '@forest-fire/types';
import { FixtureError } from '~/errors/FixtureError';

let mockPrepared = false;

/**
 * **MockApi**
 *
 * Provides a API surface to build realistic data from your models
 * based on property types but getting more refined where a model has
 * a `@mock()` function defined for it.
 */
export class MockApi<TSdk extends ISdk, T extends Model> {
  public config: IMockRelationshipConfig = {
    relationshipBehavior: 'ignore',
    exceptionPassthrough: false,
  };

  constructor(db: IDatabaseSdk<TSdk>, modelConstructor: FmModelConstructor<T>) {
    this._db = db;
    this._modelConstructor = modelConstructor;
  }
  private _db: IDatabaseSdk<TSdk>;
  private _modelConstructor: FmModelConstructor<T>;

  /**
   * generate
   *
   * Populates the mock database with values for a given model passed in.
   *
   * @param count how many instances of the given Model do you want?
   * @param exceptions do you want to fix a given set of properties to a static value?
   */
  async generate(
    count: number,
    exceptions: Partial<T> = {}
  ): Promise<Array<IMockResponse<T>>> {
    const props = mockProperties<TSdk, T>(this._db, this.config, exceptions);
    const relns = addRelationships<TSdk, T, IDatabaseSdk<TSdk>>(
      this._db,
      this.config,
      exceptions
    );

    // create record; using any incoming exception to build the object.
    // this is primarily to form the "composite key" where it is needed
    const record = Record.createWith(
      this._modelConstructor,
      exceptions as Partial<T>,
      { db: this._db }
    ) as Record<TSdk, T>;

    if (record.hasDynamicPath) {
      // which props -- required for compositeKey -- are not yet
      // set
      const notCovered = record.dynamicPathComponents.filter(
        (key) => !Object.keys(exceptions).includes(key)
      );
      // for now we are stating that these two mock-types can
      // be used to dig us out of this deficit; we should
      // consider openning this up
      // TODO: consider opening up other mockTypes to fill in the compositeKey
      const validMocks = ['sequence', 'random', 'distribution'];
      notCovered.forEach((key) => {
        const prop: IDictionary =
          record.META.property(key as keyof IModel<T> & string) || {};
        const mock = prop.mockType;
        if (
          !mock ||
          (typeof mock !== 'function' && !validMocks.includes(mock as string))
        ) {
          throw new FixtureError(
            `The mock for the "${
              record.modelName
            }" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(
              exceptions || {}
            )} ] of generate() nor was the model constrained by a @mock type ${
              mock ? `[ ${mock} ]` : ''
            } which is deemed valid. Valid named mocks are ${JSON.stringify(
              validMocks
            )}; all bespoke mocks are accepted as valid.`,
            `firemodel/mock-not-ready`
          );
        }
      });
    }

    let mocks: Array<IMockResponse<T>> = [];

    for (const i of Array(count)) {
      const a = await relns(await props(record));
      mocks = mocks.concat();
    }

    return mocks;
  }

  /**
   * createRelationshipLinks
   *
   * Creates FK links for all the relationships in the model you are generating.
   *
   * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
   */
  createRelationshipLinks(
    cardinality?: IDictionary<[number, number] | number | true>
  ) {
    this.config.relationshipBehavior = 'link';
    return this;
  }

  /**
   * Allows variation in how dynamic paths are configured on FK relationships
   */
  dynamicPathBehavior(options: string) {
    //
    return this;
  }

  /**
   * All overrides for the primary model are passed along to FK's as well
   */
  overridesPassThrough() {
    this.config.exceptionPassthrough = true;
    return this;
  }

  /**
   * followRelationshipLinks
   *
   * Creates FK links for all the relationships in the model you are generating; also generates
   * mocks for all the FK links.
   *
   * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
   */
  followRelationshipLinks(
    cardinality?: IDictionary<[number, number] | number | true>
  ) {
    // TODO: would like to move back to ICardinalityConfig<T> when I can figure out why Partial doesn't work
    this.config.relationshipBehavior = 'follow';
    if (cardinality) {
      this.config.cardinality = cardinality;
    }
    return this;
  }
}
