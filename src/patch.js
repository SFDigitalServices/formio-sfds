const PATCHED = `sfds-patch-${Date.now()}`

export default Formio => {
  if (Formio[PATCHED]) {
    return
  }

  patchAddressSchema(Formio.Components.components.address)
  Formio[PATCHED] = true
}

function patchAddressSchema (AddressComponent) {
  const defaultSchema = AddressComponent.schema

  AddressComponent.schema = (...extend) => {
    // Get the "base" schema
    const schema = defaultSchema(...extend)

    // Overwrite the components array
    //
    // Note: if you provide `components: [...]` in the call to defaultSchema()
    // above, the merge operation keeps some of the removed items, like the
    // country input, intact.
    schema.components = [
      {
        label: 'Address line 1',
        tableView: false,
        key: 'address1',
        type: 'textfield',
        input: true
      },
      {
        label: 'Address line 2',
        tableView: false,
        key: 'address2',
        type: 'textfield',
        input: true
      },
      {
        label: 'City',
        tableView: false,
        key: 'city',
        type: 'textfield',
        input: true
      },
      {
        type: 'columns',
        columns: [
          {
            width: 4,
            components: [
              {
                label: 'State',
                tableView: false,
                key: 'state',
                type: 'textfield',
                input: true
              }
            ]
          },
          {
            width: 2,
            components: [
              {
                label: 'ZIP code',
                tableView: false,
                key: 'zip',
                type: 'textfield',
                input: true
              }
            ]
          }
        ]
      }
    ]

    return schema
  }

  // Lastly, redefine the getters for manualMode and manualModeEnabled so that
  // the existing address component implementation only shows our inputs (and
  // not the autocomplete UI)
  Object.defineProperties(AddressComponent.prototype, {
    manualMode: {
      get () { return true }
    },
    manualModeEnabled: {
      get () { return true }
    }
  })
}
