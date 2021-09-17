module.exports = {
  plugins: ['sfgov'],
  extends: [
    'plugin:sfgov/recommended',
    'plugin:sfgov/babel'
  ],
  rules: {
    'promise/no-callback-in-promise': 0,
    'import/no-unresolved': [2, {
      ignore: ['^../dist']
    }]
  }
}
