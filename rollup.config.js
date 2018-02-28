import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/index.js',
  output: {
    name: 'sbxcore',
    sourcemap: false,
    file: 'dist/bundles/sbxcore.umd.js',
    format: 'umd',
    globals: {
      'sbx-querybuilder/index': 'QueryBuilder'
    }
  },
  external: [
    'sbx-querybuilder/index'
  ],
  plugins: [
    resolve({
      module: true,
      main: true
    })
  ]
};