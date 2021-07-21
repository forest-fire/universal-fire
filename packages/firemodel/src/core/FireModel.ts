/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { IDictionary } from "common-types";
import {
  IFmChangedProperties,
  IModel,
  IReduxAction,
  IReduxDispatch,
  ModelMeta
} from "@/types";

import {
  modelRegister,
  listRegisteredModels,
  modelRegistryLookup,
} from "@/util";

import { Record, DefaultDbCache } from "@/core";
import { IDatabaseSdk, ISdk, } from "@forest-fire/types";
import { convertModelToModelClass } from "@/util/convertModelToModelClass";

const defaultDispatch: IReduxDispatch = async (context: IReduxAction) => Promise.resolve(context);

export class FireModel<S extends ISdk, T extends IModel> {
  public static get defaultDb() {
    const db = DefaultDbCache().get();
    return db as unknown as IDatabaseSdk<typeof db.sdk>
  }

  /**
   * Any FireModel transaction needs to connect to the database
   * via a passed-in reference to an SDK provided by `universal-fire`. 
   * These references can be done with any/every transaction via
   * the options hash but it is often more convient to set a "fallback" or
   * "default" database to use should a given transaction not state a DB
   * connection explicitly.
   */
  public static set defaultDb(db: IDatabaseSdk<ISdk>) {
    DefaultDbCache().set<IDatabaseSdk<typeof db.sdk>>(db);
  }

  /**
   * All Watchers and write-based transactions in FireModel offer a way to
   * call out to a "dispatch" function. This can be done on a per-transaction
   * basis but more typically it makes sense to just set this once here and then
   * all subsequent transactions will use this dispatch function unless they are
   * explicitly passed another.
   */
  public static set dispatch(fn: IReduxDispatch) {
    if (!fn) {
      FireModel._dispatchActive = false;
      FireModel._dispatch = defaultDispatch;
    } else {
      FireModel._dispatchActive = true;
      FireModel._dispatch = fn;
    }
  }

  /**
   * The default dispatch function which should be called/notified whenever
   * a write based transaction has modified state.
   */
  public static get dispatch() {
    return FireModel._dispatch;
  }

  //#endregion

  //#region PUBLIC INTERFACE

  /**
   * The name of the model; typically a _singular_ name
   */
  public get modelName(): string {
    const name = this._model.constructor.name;
    const pascal = name.slice(0, 1).toLowerCase() + name.slice(1);

    return pascal;
  }

  public get dispatch() {
    return FireModel.dispatch;
  }

  public static get isDefaultDispatch() {
    return FireModel.dispatch === defaultDispatch;
  }

  public get dispatchIsActive(): boolean {
    return FireModel._dispatchActive;
  }

  /** the connected real-time database */
  public get db(): IDatabaseSdk<S> {
    if (!this._db) {
      this._db = DefaultDbCache().get() as unknown as IDatabaseSdk<S>;
    }
    if (!this._db) {
      const e = new Error(
        `Can't get DB as it has not been set yet for this instance and no default database exists [ ${this.modelName} ]!`
      );
      e.name = "FireModel::NoDatabase";
      throw e;
    }

    return this._db;
  }

  public get META(): ModelMeta<T> {
    return convertModelToModelClass(new this._modelConstructor).META;
  }

  public get pushKeys() {
    return convertModelToModelClass(new this._modelConstructor()).META.pushKeys;
  }

  public static auditLogs = "/auditing";

  public static register<T extends IModel = IModel>(model: new () => T) {
    modelRegister(model);
  }

  public static listRegisteredModels() {
    return listRegisteredModels();
  }

  public static lookupModel<T extends IModel>(name: string) {
    return modelRegistryLookup<T>(name);
  }

  //#region STATIC INTERFACE

  public static isBeingWatched(path: string): boolean {
    // TODO: implement this!
    return false;
  }
  private static _defaultDb: IDatabaseSdk<ISdk>;
  private static _dispatchActive = false;
  /** the dispatch function used to interact with frontend frameworks */
  private static _dispatch: IReduxDispatch = defaultDispatch;

  //#endregion

  //#region OBJECT INTERFACE

  /** the data structure/model that this class operates around */
  protected _model: T;
  protected _modelConstructor: new () => T;
  protected _db: IDatabaseSdk<S>;

  //#endregion

  //#region PROTECTED INTERFACE

  protected _getPaths(
    rec: Record<S, T>,
    deltas: IFmChangedProperties<T>
  ): IDictionary {
    const added = (deltas.added || []).reduce((agg: IDictionary, curr) => {
      agg[`${rec.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = rec.get(curr);
      return agg;
    }, {});
    const removed = (deltas.removed || []).reduce((agg: IDictionary, curr) => {
      agg[`${rec.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = null;
      return agg;
    }, {});
    const updated = (deltas.changed || []).reduce((agg: IDictionary, curr) => {
      agg[`${rec.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = rec.get(curr);
      return agg;
    }, {});

    return { ...added, ...removed, ...updated };
  }

  //#endregion
}
