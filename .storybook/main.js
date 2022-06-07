module.exports = {
  framework: '@storybook/react',
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ]
}
