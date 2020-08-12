const { textfield: TextField } = window.Formio.Components.components

export default class ZIPCode extends TextField {
  static schema (...extend) {
    return TextField.schema({
      // these are schema fields that should be overridden
      key: 'zip',
      validate: {
        required: true,
        maxLength: 10,
        pattern: '([0-9]{5}(-[0-9]{4})?)?'
      },
      errors: {
        pattern: 'Please enter a 5-digit <a href="https://en.wikipedia.org/wiki/ZIP_Code">ZIP code</a>'
      }
    }, ...extend)
  }

  get defaultSchema () {
    return ZIPCode.schema()
  }

  static get builderInfo () {
    return {
      title: 'ZIP code',
      icon: 'map-marker',
      group: 'sfgov',
      schema: ZIPCode.schema()
    }
  }
}
