import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import jst from 'rollup-plugin-jst'
import babel from 'rollup-plugin-babel'
import svg from 'rollup-plugin-svgo'
import postcss from 'rollup-plugin-postcss'
import dsv from '@rollup/plugin-dsv'
import pkg from './package.json'

const name = 'FormioSFDS'

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
  dsv(),
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
      name,
      file: 'dist/formio-sfds.standalone.js'
    }
  },
  {
    input: pkg.module,
    output: {
      format: 'umd',
      exports: 'named',
      name,
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
      exports: 'named',
      name,
      file: pkg.main
    }
  }
]
