module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'vdo'
    }],
    'babel-plugin-lodash'
  ]
}
