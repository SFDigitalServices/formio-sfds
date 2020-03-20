import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import jst from 'rollup-plugin-jst'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const commonPlugins = [
  babel(),
  resolve(),
  jst({
    templateOptions: {
      evaluate: /\{%([\s\S]+?)%\}/g,
      interpolate: /\{\{([\s\S]+?)\}\}/g,
      escape: /\{\{\{([\s\S]+?)\}\}\}/g,
      variable: 'ctx'
    }
  })
]

export default [
  {
    input: pkg.module,
    output: {
      format: 'umd',
      name: 'FormioSFDS',
      file: pkg.browser
    },
    plugins: [
      ...commonPlugins,
      commonjs()
    ]
  },
  {
    input: pkg.module,
    external: ['formiojs'],
    plugins: [
      ...commonPlugins
    ],
    output: {
      format: 'cjs',
      file: pkg.main
    }
  }
]
