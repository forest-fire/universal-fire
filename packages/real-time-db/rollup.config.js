import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/abstracted-firebase.es.js",
      format: "es",
      name: "AbstractedFirebase",
      sourcemap: true
    },
    {
      file: "dist/abstracted-firebase.cjs.js",
      format: "cjs",
      name: "AbstractedFirebase",
      sourcemap: true
    },
    {
      file: "dist/abstracted-firebase.umd.js",
      format: "umd",
      name: "AbstractedFirebase",
      sourcemap: true,
      globals: {
        "firebase-api-surface": "firebaseApiSurface",
        "typed-conversions": "convert",
        "common-types": "commonTypes",
        "serialized-query": "serializedQuery",
        "abstracted-firebase": "abstractedFirebase"
      }
    }
  ],
  external: [
    "firebase-api-surface",
    "typed-conversions",
    "serialized-query",
    "common-types",
    "wait-in-parallel"
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.esnext.json"
    })
  ]
};
