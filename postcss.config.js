module.exports = {
  syntax: 'postcss-scss',
  plugins: [
    require('@csstools/postcss-sass')({
      includePaths: ['node_modules'],
      outputStyle: process.env.NODE_ENV === 'production' ? 'condensed' : 'expanded'
    }),
    require('autoprefixer')()
  ]
}
