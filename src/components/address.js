const { container: Container } = window.Formio.Components.components

export default class AddressComponent extends Container {
  static schema (...extend) {
    return Container.schema({
      type: 'customAddress',
      label: 'Address',
      key: 'address',
      hideLabel: false,
      showCountry: false,
      components: [
        {
          label: 'Address line 1',
          tableView: false,
          key: 'line1',
          type: 'textfield',
          input: true,
          validate: { required: true }
        },
        {
          label: 'Address line 2',
          tableView: false,
          key: 'line2',
          type: 'textfield',
          input: true
        },
        {
          label: 'City',
          tableView: false,
          key: 'city',
          type: 'textfield',
          input: true,
          validate: { required: true }
        },
        {
          type: 'columns',
          key: 'stateAndZip',
          columns: [
            {
              width: 6,
              components: [
                {
                  label: 'State',
                  tableView: false,
                  key: 'state',
                  type: 'state',
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
                  type: 'zip'
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
    return 'well'
  }
}
