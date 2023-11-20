/* eslint-disable import/no-named-as-default */
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import jst from 'rollup-plugin-jst'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import svgo from 'rollup-plugin-svgo'
import define from 'rollup-plugin-define'
import { terser } from 'rollup-plugin-terser'
import rollupYAML from '@rollup/plugin-yaml'

const {
  NODE_ENV = 'development',
  I18N_SERVICE_URL = 'https://translate.sf.gov'
} = process.env

const prod = NODE_ENV === 'production'
const name = 'FormioSFDS'

const external = []

const commonPlugins = [
  resolve(),
  commonjs(),
  json(),
  jst({
    extensions: ['.ejs'],
    templateOptions: {
      evaluate: /\{%([\s\S]+?)%\}/g,
      interpolate: /\{\{([\s\S]+?)\}\}/g,
      escape: /\{\{\{([\s\S]+?)\}\}\}/g,
      variable: 'ctx'
    }
  }),
  define({
    replacements: {
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.I18N_SERVICE_URL': JSON.stringify(I18N_SERVICE_URL)
    }
  }),
  svgo(require('./svgo.config')),
  babel({
    babelHelpers: 'runtime'
  }),
  prod ? terser() : null
].filter(Boolean)

export default [
  {
    input: 'src/standalone.js',
    external,
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
      file: pkg.browser,
      sourcemap: prod
    }
  },
  {
    input: 'src/examples.js',
    external,
    plugins: [
      ...commonPlugins,
      rollupYAML()
    ],
    output: {
      format: 'umd',
      file: 'dist/examples.js',
      sourcemap: true
    }
  },
  {
    input: 'src/portal.js',
    external,
    plugins: [
      ...commonPlugins,
      rollupYAML()
    ],
    output: {
      format: 'umd',
      file: 'dist/portal.js',
      sourcemap: true
    }
  }
]
