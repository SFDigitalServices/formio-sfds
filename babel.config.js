module.exports = {
  presets: [
    ['@babel/preset-env', {
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-optional-chaining', {
    }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true
    }],
    ['babel-plugin-lodash', {
    }]
  ]
}
