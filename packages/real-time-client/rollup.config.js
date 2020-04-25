import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/db.ts",
  output: [
    {
      file: "dist/abstracted-client.es.js",
      format: "es",
      sourcemap: true
    },
    {
      file: "dist/abstracted-client.cjs.js",
      format: "cjs",
      sourcemap: true
    },
    {
      file: "dist/abstracted-client.umd.js",
      format: "umd",
      name: "AbstractedClient",
      sourcemap: true
    }
  ],
  globals: {
    "abstracted-firebase": "abstractedFirebase",
    events: "EventEmitter",
    "@firebase/database": "database"
  },
  external: [
    "firebase-api-surface",
    "typed-conversions",
    "serialized-query",
    "abstracted-firebase",
    "@firebase/app-types",
    "events"
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.esnext.json"
    })
  ]
};
