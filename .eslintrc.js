module.exports = {
  plugins: ['sfgov'],
  extends: [
    'plugin:storybook/recommended',
    'plugin:sfgov/babel',
    'plugin:sfgov/recommended'
  ],
  rules: {
    'promise/no-callback-in-promise': 0,
    'import/no-unresolved': [2, {
      ignore: ['^../dist']
    }]
  }
}
