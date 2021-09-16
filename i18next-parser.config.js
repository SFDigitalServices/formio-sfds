module.exports = {
  defaultNamespace: 'translation',
  locales: ['en', 'es', 'tl', 'zh'],
  input: ['node_modules/formiojs/dist/**/*.js'],
  output: 'src/i18n/$LOCALE.json',
  namespaceSeparator: false,
  keySeparator: false,
  pluralSeparator: '_',
  skipDefaultValues: false,
  createOldCatalogs: false,
  keepRemoved: true,
  sort: true,
  verbose: true,
  failOnWarnings: false
}
