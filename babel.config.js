module.exports = {
  presets: [
    ['@babel/preset-env']
  ],
  plugins: [
    ['@babel/plugin-transform-regenerator', {
      async: true
    }]
  ]
}
