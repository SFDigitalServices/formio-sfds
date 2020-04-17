const { NODE_ENV = 'development' } = process.env

module.exports = {
  syntax: 'postcss-scss',
  plugins: [
    require('@csstools/postcss-sass')({
      includePaths: ['node_modules'],
      outputStyle: NODE_ENV === 'production' ? 'compressed' : 'expanded'
    }),
    require('postcss-import')(),
    require('postcss-inline-svg')({
      removeFill: true
    }),
    require('autoprefixer')()
  ]
}
