const { container: Container } = window.Formio.Components.components

export default class AddressComponent extends Container {
  static schema (...extend) {
    return Container.schema(defaultSchema, ...extend)
  }

  get defaultSchema () {
    return defaultSchema
  }

  get templateName () {
    return 'address'
  }

  get manualMode () {
    return true
  }

  get manualModeEnabled () {
    return false
  }

  render () {
    return this.renderTemplate(this.templateName, {
      children: this.renderComponents(),
      nestedKey: this.nestedKey,
      ref: {},
      inputAttributes: {
        name: this.options.name,
        type: 'text',
        tabindex: 0
      },
      mode: {
        autocomplete: false,
        manual: true
      }
    })
  }

  static get builderInfo () {
    return {
      title: 'Address',
      icon: 'home',
      group: 'sfgov',
      schema: defaultSchema
    }
  }
}

const defaultSchema = {
  label: 'Address',
  hideLabel: false,
  type: 'address',
  key: 'address',
  description: '',
  tableView: true,
  components: [
    {
      label: 'Address line 1',
      key: 'line1',
      type: 'textfield',
      input: true,
      validate: { required: true }
    },
    {
      label: 'Address line 2',
      key: 'line2',
      type: 'textfield',
      input: true
    },
    {
      label: 'City',
      key: 'city',
      type: 'textfield',
      validate: { required: true }
    },
    {
      type: 'columns',
      columns: [
        {
          width: 6,
          components: [
            {
              label: 'State',
              key: 'state',
              type: 'state',
              input: true,
              customClass: 'mb-sm-2',
              validate: { required: true }
            }
          ]
        },
        {
          width: 6,
          components: [
            {
              label: 'ZIP code',
              key: 'zip',
              type: 'zip',
              input: true
            }
          ]
        }
      ]
    }
  ]
}
