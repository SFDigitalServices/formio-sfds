import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import jst from 'rollup-plugin-jst'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import svg from 'rollup-plugin-svgo'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import { terser } from 'rollup-plugin-terser'
import yaml from '@rollup/plugin-yaml'

const {
  NODE_ENV = 'development',
  I18N_SERVICE_URL = 'https://i18n-microservice-js.sfds.vercel.app'
} = process.env

const env = { NODE_ENV, I18N_SERVICE_URL }
console.warn('rollup env:', env)

const prod = NODE_ENV === 'production'
const name = 'FormioSFDS'

const commonPlugins = [
  resolve(),
  commonjs(),
  json(),
  jst({
    templateOptions: {
      evaluate: /\{%([\s\S]+?)%\}/g,
      interpolate: /\{\{([\s\S]+?)\}\}/g,
      escape: /\{\{\{([\s\S]+?)\}\}\}/g,
      variable: 'ctx'
    }
  }),
  injectProcessEnv(env, {
    include: 'src/**/*.js'
  }),
  svg({
    plugins: [
      { removeViewBox: false },
      { removeDimensions: true },
      {
        // remove fill attributes from all elements
        removeAttributesBySelector: {
          selector: '[fill]',
          attributes: ['fill']
        }
      },
      {
        addAttributesToSVGElement: {
          attributes: [
            // add fill="currentColor" to <svg>
            { fill: 'currentColor' }
          ]
        }
      }
    ]
  }),
  babel({
    babelHelpers: 'bundled'
  }),
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
      file: 'dist/formio-sfds.standalone.js',
      sourcemap: prod
    }
  },
  {
    input: pkg.module,
    output: {
      format: 'umd',
      exports: 'named',
      name,
      file: pkg.browser,
      sourcemap: prod
    },
    plugins: [
      ...commonPlugins
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
      file: pkg.main,
      sourcemap: prod
    }
  },
  {
    input: 'src/examples.js',
    plugins: [
      ...commonPlugins,
      yaml()
    ],
    output: {
      format: 'umd',
      file: 'dist/examples.js'
    }
  },
  {
    input: 'src/translate.js',
    plugins: [
      ...commonPlugins
    ],
    output: {
      format: 'umd',
      file: 'dist/translate.js'
    }
  }
]
