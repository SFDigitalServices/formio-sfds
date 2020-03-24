import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import jst from 'rollup-plugin-jst'
import babel from 'rollup-plugin-babel'
import svg from 'rollup-plugin-svgo'
import pkg from './package.json'

const commonPlugins = [
  jst({
    templateOptions: {
      evaluate: /\{%([\s\S]+?)%\}/g,
      interpolate: /\{\{([\s\S]+?)\}\}/g,
      escape: /\{\{\{([\s\S]+?)\}\}\}/g,
      variable: 'ctx'
    }
  }),
  svg({
    plugins: [
      { removeViewBox: false },
      { removeDimensions: true }
    ]
  }),
  babel(),
  resolve()
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
