import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    terser(), // minifies generated bundles
  ],
};
