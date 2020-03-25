import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import jst from 'rollup-plugin-jst'
import babel from 'rollup-plugin-babel'
import svg from 'rollup-plugin-svgo'
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json'

const postcssPlugins = require('./postcss.config')

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
    input: 'src/standalone.js',
    plugins: [
      ...commonPlugins,
      postcss({
        extensions: ['.css'],
        inject: true
      })
    ],
    output: {
      format: 'umd',
      name: 'FormioSFDS',
      file: 'dist/formio-sfds.standalone.js'
    }
  },
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
