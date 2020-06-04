const { textfield: TextField } = window.Formio.Components.components

export default class ZIPCode extends TextField {
  static schema (...extend) {
    return TextField.schema({
      // these are schema fields that should be overridden
      type: 'zip',
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

  static get builderInfo () {
    return {
      title: 'ZIP code',
      group: 'sfds',
      schema: ZIPCode.schema()
    }
  }

  get defaultSchema () {
    return ZIPCode.schema()
  }
}
