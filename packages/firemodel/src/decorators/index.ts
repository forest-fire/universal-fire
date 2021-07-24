// #autoindex:named, exclude: propertyReflector
export * from "./propertyReflector";

// #region autoindexed files

// index last changed at: 7th Jul, 2021, 03:39 PM ( GMT-7 )
// export: named; exclusions: propertyReflector, index, private.
// files: OneWay, decorator, defaultValue, encrypt, hasMany, hasOne, indexing, mock, model, reflection-types.
// directories: constraints.

// local file exports
export * from "./OneWay";
export * from "./decorator";
export * from "./defaultValue";
export * from "./encrypt";
export * from "./hasMany";
export * from "./hasOne";
export * from "./indexing";
export * from "./mock";
export * from "./model";
export * from "./reflection-types";

// directory exports
export * from "./constraints/index";

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
