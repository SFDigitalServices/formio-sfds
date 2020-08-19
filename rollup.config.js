import babel from 'rollup-plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import jst from 'rollup-plugin-jst'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import svgo from 'rollup-plugin-svgo'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import { terser } from 'rollup-plugin-terser'
import rollupYAML from '@rollup/plugin-yaml'
import yaml from 'js-yaml'
import { readFileSync } from 'fs'

const {
  NODE_ENV = 'development',
  I18N_SERVICE_URL
} = process.env

const prod = NODE_ENV === 'production'
const name = 'FormioSFDS'

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
  injectProcessEnv({
    NODE_ENV,
    I18N_SERVICE_URL
  }, {
    include: 'src/**/*.js'
  }),
  svgo(
    yaml.safeLoad(
      readFileSync('svgo.config.yml', 'utf8')
    )
  ),
  babel(),
  prod ? terser() : null
].filter(Boolean)

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
      file: pkg.browser,
      sourcemap: prod
    }
  },
  {
    input: 'src/examples.js',
    plugins: [
      ...commonPlugins,
      rollupYAML()
    ],
    output: {
      format: 'umd',
      file: 'dist/examples.js'
    }
  },
  {
    input: 'src/portal.js',
    plugins: [
      ...commonPlugins,
      rollupYAML()
    ],
    output: {
      format: 'umd',
      file: 'dist/portal.js'
    }
  }
]
