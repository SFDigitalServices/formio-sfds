module.exports = {
  plugins: ['sfgov'],
  extends: [
    'plugin:sfgov/recommended',
    'plugin:sfgov/babel'
  ],
  rules: {
    'promise/no-callback-in-promise': 0
  }
}
