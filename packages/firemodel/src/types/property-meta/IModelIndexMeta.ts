export interface IModelIndexMeta {
  /**
   * A property that has been stated as _indexable_ an property
   * with the `@index` decorator. This property can be a _unique_ or
   * _non-unique_ property in Firebase (which makes no distinction between
   * the two) but if you want to distinguish for the benefit of databases
   * like IndexDB (see Dexie integration), then you should view this as a
   * _non-dintinct_ indexed property designation.
   */
  isIndex: boolean;
  /**
   * A _unique_ index indicates that the property should be **indexed** by
   * Firebase AND that it should be treated as a unique property. Firebase
   * doesn't actually treat this any differently than a normal `@index` but
   * if you are using other forms of state that distinguish this -- like
   * **IndexDB** -- this is a useful distinction.
   */
  isUniqueIndex: boolean;
  /**
   * A `MultiEntry` index is defined in **IndexDB** as an index which refers
   * to an Array property; because Firebase prefers _arrays_ to structured
   * as a hash/dictionary of pushkeys this type of index is less common but
   * it possible.
   *
   * [Dexie Docs](https://dexie.org/docs/MultiEntry-Index)
   */
  isMultiEntryIndex: boolean;
  /** a descriptive name for human audiences */
  desc?: string;
  /** the property name */
  property: string;
}