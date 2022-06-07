const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  framework: '@storybook/react',
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  webpackFinal: async (config, { configType }) => {
    // analyze webpack bundle size. To enable run storybook with `cross-env analyze=true`
    // not needed, but helps debug the problem :)
    const shouldAnalyze = process.env.analyze === 'true'
    if (shouldAnalyze) {
      config.plugins.push(
        new BundleAnalyzerPlugin()
      )
    }

    // split into more chunks
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        minSize: 30 * 1024, // 30KB
        maxSize: 1024 * 1024 // 1MB
      }
    }

    return config
  }
}
