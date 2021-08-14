// #autoindex:named, exclude: iso-path-join

// #region autoindexed files

// index last changed at: 7th Jul, 2021, 08:38 PM ( GMT-7 )
// export: named; exclusions: iso-path-join, index, private.
// files: IFmModelMeta, actions, constants, dexie-types, events, firemodel-types, general, model-relationships, models, other, proxy, queries, record-types, relationships, state-mgmt, utility-types, watcher-types.
// directories: property-meta.

// local file exports
export * from "./IFmModelMeta";
export * from "./actions";
export * from "./constants";
export * from "./dexie-types";
export * from "./events";
export * from "./firemodel-types";
export * from "./general";
export * from "./model-relationships";
export * from "./models";
export * from "./other";
export * from "./proxy";
export * from "./queries";
export * from "./record-types";
export * from "./relationships";
export * from "./state-mgmt";
export * from "./utility-types";
export * from "./watcher-types";

// directory exports
export * from "./property-meta/index";

// Note:
// -----
// This file was created by running: "dd devops autoindex"; it assumes you have
// the 'do-devops' pkg installed as a dev dep.
//
// By default it assumes that exports are named exports but this can be changed by
// adding a modifier to the '// #autoindex' syntax:
//
//    - autoindex:named     same as default, exports "named symbols"
//    - autoindex:default   assumes each file is exporting a default export
//                          and converts the default export to the name of the
//                          file
//    - autoindex:offset    assumes files export "named symbols" but that each
//                          file's symbols should be offset by the file's name
//                          (useful for files which might symbols which collide
//                          or where the namespacing helps consumers)
//
// You may also exclude certain files or directories by adding it to the
// autoindex command. As an example:
//
//    - autoindex:named, exclude: foo,bar,baz
//
// Also be aware that all of your content outside the defined region in this file
// will be preserved in situations where you need to do something paricularly awesome.
// Keep on being awesome.

// #endregion
