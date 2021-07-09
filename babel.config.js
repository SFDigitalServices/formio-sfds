module.exports = {
  presets: [
    ['@babel/preset-env', {
    }],
    ['@babel/preset-react', {
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
