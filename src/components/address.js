const { container: Container } = window.Formio.Components.components

const componentClass = 'mb-1'

export default class AddressComponent extends Container {
  static schema (...extend) {
    return Container.schema({
      type: 'customAddress',
      label: 'Address',
      key: 'address',
      hideLabel: false,
      tableView: true,
      components: [
        {
          label: 'Address line 1',
          key: 'line1',
          type: 'textfield',
          input: true,
          customClass: componentClass,
          validate: { required: true }
        },
        {
          label: 'Address line 2',
          key: 'line2',
          type: 'textfield',
          customClass: componentClass,
          input: true
        },
        {
          label: 'City',
          key: 'city',
          type: 'textfield',
          customClass: componentClass,
          input: true,
          validate: { required: true }
        },
        {
          type: 'columns',
          customClass: 'mb-0',
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
    }, ...extend)
  }

  get defaultSchema () {
    return AddressComponent.schema()
  }

  get templateName () {
    return 'address'
  }
}
