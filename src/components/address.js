const { container: Container } = window.Formio.Components.components

const STATES = [{ label: 'California', value: 'CA' }]

const COUNTRIES = [{ label: 'United States', value: 'US' }]

export default class AddressComponent extends Container {
  static schema (rest) {
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
          columns: [
            {
              width: 6,
              components: [
                {
                  label: 'State',
                  tableView: false,
                  key: 'state',
                  type: 'select',
                  input: true,
                  widget: 'html5',
                  dataSrc: 'values',
                  data: {
                    values: STATES
                  },
                  validate: { required: true }
                }
              ]
            },
            {
              width: 6,
              components: [
                {
                  label: 'ZIP Code',
                  tableView: false,
                  key: 'zip',
                  type: 'textfield',
                  input: true,
                  validate: {
                    required: true,
                    maxLength: 10,
                    pattern: '([0-9]{5}(-[0-9]{4})?)?'
                  },
                  errors: {
                    pattern:
                      'Please enter a 5-digit <a href="https://en.wikipedia.org/wiki/ZIP_Code">ZIP code</a>'
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Country',
          tableView: false,
          key: 'country',
          type: 'select',
          dataSrc: 'values',
          widget: 'html5',
          data: { values: COUNTRIES },
          defaultValue: 'us',
          input: true,
          customConditional: ({ self }) => self.parent.component.showCountry
        }
      ]
    })
  }

  get defaultSchema () {
    return AddressComponent.schema()
  }

  get templateName () {
    return 'well'
  }
}
