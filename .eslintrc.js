module.exports = {
  plugins: ['sfgov'],
  extends: [
    'plugin:storybook/recommended',
    'plugin:sfgov/babel',
    'plugin:sfgov/recommended'
  ],
  rules: {
    'promise/always-return': 0,
    'promise/catch-or-return': 0,
    'promise/no-callback-in-promise': 0,
    'import/no-unresolved': [2, {
      ignore: ['^../dist']
    }]
  }
}
