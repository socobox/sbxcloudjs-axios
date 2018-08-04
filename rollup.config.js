import resolve from 'rollup-plugin-node-resolve';

const globals = {
  'sbx-querybuilder/index': 'QueryBuilder',
  'async/eachLimit': 'eachLimit',
  'axios': 'axios',
  'sbxcorejs': 'Find'
};

export default {
  input: 'dist/index.js',
  output: {
    name: 'sbxaxios',
    sourcemap: false,
    file: 'dist/bundles/sbx.umd.js',
    format: 'umd',
    globals: globals
  },
  external: Object.keys(globals),
  plugins: [
    resolve({
      module: true,
      main: true
    })
  ]
};