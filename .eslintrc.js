/** @type {import('eslint').ESLint.Options} */
module.exports = {
  plugins: [
    'react',
    'sfgov'
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:storybook/recommended',
    'plugin:sfgov/recommended',
    'plugin:sfgov/babel'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'promise/always-return': 0,
    'promise/catch-or-return': 0,
    'promise/no-callback-in-promise': 0,
    'react/prop-types': ['warn'],
    'import/no-unresolved': [2, {
      ignore: [
        '^../dist',
        '../react/form'
      ]
    }]
  }
}
