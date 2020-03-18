import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [
  {
    input: pkg.module,
    output: {
      format: 'umd',
      name: 'FormioSFDS',
      file: pkg.browser
    },
    plugins: [
      babel(),
      resolve(),
      commonjs()
    ]
  },
  {
    input: pkg.module,
    external: ['formiojs'],
    plugins: [
      resolve(),
      babel()
    ],
    output: {
      format: 'cjs',
      file: pkg.main
    }
  }
]
