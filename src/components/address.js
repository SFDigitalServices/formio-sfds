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
  // XXX this is necessary to activate the container builder UI
  type: 'container',
  key: 'address',
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
      validate: { required: true },
      defaultValue: 'San Francisco'
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
              customClass: 'mb-0',
              input: true,
              defaultValue: 'CA',
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
              customClass: 'mb-0',
              input: true
            }
          ]
        }
      ]
    }
  ]
}
