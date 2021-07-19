import { IRelationship, ISchema, SchemaCallback } from '~/@types';
import { addException, Queue, SchemaHelper } from '~/index';
import { pluralize } from 'native-dash';
import faker from "faker"

/**
 * The property that exists on the source scheme as a FK reference
 * to the external schema/entity.
 */
export type SourceProperty = string;

export class Schema<T = any> {
  private _schemas = new Queue<ISchema>('schemas');
  private _relationships = new Queue<IRelationship>('relationships');

  constructor(public schemaId: string, mockFn?: SchemaCallback<T>) {
    if (mockFn) {
      this.mock(mockFn);
    }
  }

  /**
   * Add a mocking function to be used to generate the schema in mock DB
   */
  public mock(cb: SchemaCallback<T>, newSchemaId?: string) {
    const schemaId = newSchemaId || this.schemaId;
    this._schemas.enqueue({
      id: schemaId,
      fn: cb(new SchemaHelper<T>({} as T, faker)), // TODO: pass in support for DB lookups
      path: () => {
        const schema: ISchema = this._schemas.find(schemaId);

        return [
          schema.prefix,
          schema.modelName
            ? pluralize(schema.modelName)
            : pluralize(newSchemaId || this.schemaId),
        ].join('/');
      },
    });

    return this;
  }

  /**
   * There are times where it's appropriate to have multiple schemas for
   * the same entity/model, in this case you'll want to state what model
   * your schema is emulating. If you don't state this property it assumes
   * the schema name IS the model name
   */
  public modelName(value: string) {
    this._schemas.update(this.schemaId, { modelName: value });
    return this;
  }

  /** prefixes a static path to the beginning of the  */
  public pathPrefix(prefix: string) {
    prefix = prefix.replace(/\./g, '/'); // slash reference preferred over dot
    prefix =
      prefix.slice(-1) === '/' ? prefix.slice(0, prefix.length - 1) : prefix;
    this._schemas.update(this.schemaId, { prefix });
    return this;
  }

  /**
   * The default pluralizer is quite simple so if you find that
   * it is pluralizing incorrectly then you can manually state
   * the plural name.
   */

  public pluralName(plural: string) {
    const model = this._schemas.find(this.schemaId).modelName
      ? this._schemas.find(this.schemaId).modelName
      : this.schemaId;
    addException(model, plural);
    return this;
  }

  /**
   * Configures a "belongsTo" relationship with another schema/entity
   */
  public belongsTo(target: string, sourceProperty?: SourceProperty) {
    this._relationships.push({
      type: 'belongsTo',
      source: this.schemaId,
      target,
      sourceProperty: sourceProperty ? sourceProperty : `${target}Id`,
    });

    return this;
  }

  /**
   * Configures a "hasMany" relationship with another schema/entity
   */
  public hasMany(target: string, sourceProperty?: SourceProperty) {
    this._relationships.push({
      type: 'hasMany',
      source: this.schemaId,
      target,
      sourceProperty: sourceProperty ? sourceProperty : pluralize(target),
    });

    return this;
  }

  /** Add another schema */
  public addSchema<D>(schema: string, mock?: SchemaCallback<any>) {
    if (mock) {
      this.mock(mock, schema);
    }

    return this;
  }
}
