module.exports = {
  plugins: [
    'preset-default',
    'cleanupNumericValues',
    'removeDimensions',
    'removeHiddenElems',
    'removeViewBox',
    'removeUnknownsAndDefaults',
    'removeXMLNS',
    {
      name: 'removeAttributesBySelector',
      params: {
        selector: '[fill]',
        attributes: ['fill']
      }
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { fill: 'currentColor' }
        ]
      }
    }
  ]
}
