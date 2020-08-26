const { container: Container } = window.Formio.Components.components

export default class Blocklot extends Container {
  static schema (...extend) {
    return Container.schema({
      // these are schema fields that should be overridden
      key: 'blocklot',
      conditionalLots: (context, test, showDefault = false) => {
        if (context.data.blocklot.projectAddressDataItems) {
          const items = JSON.parse(context.data.blocklot.projectAddressDataItems)
          return test(items)
        }
        return showDefault
      },
      components: [
        {
          label: 'Project Address',
          widget: 'choicesjs',
          tableView: true,
          dataSrc: 'url',
          data: {
            url: 'https://address-microservice-js-git-jsonendpoint.sfds.vercel.app/api/eas/lookup',
            headers: [
              {
                key: '',
                value: ''
              }
            ]
          },
          valueProperty: 'address',
          dataType: 'string',
          template: '<span>{{ item.address }}</span>',
          selectThreshold: 0.3,
          customOptions: {
            noChoicesText: 'We could not find that address.'
          },
          validate: {
            required: true,
            customMessage: 'We cannot find that block and lot number. Look up your block and lot with your project address in <a>our property information map.</a>',
            select: false
          },
          key: 'selectProjectAddress',
          tags: [
            'autocomplete'
          ],
          type: 'select',
          indexeddb: {
            filter: {}
          },
          selectValues: 'data.items',
          searchField: 'search',
          minSearch: 2,
          filter: '$select=distinct address&$limit=100',
          limit: 5,
          input: true,
          disableLimit: false,
          lazyLoad: false
        },
        {
          label: 'Project Address Data',
          persistent: false,
          customDefaultValue: (context) => {
            var utils = context.utils
            var form = context.form
            var selectProjectAddress = utils.getComponent(form.components[0].components, 'selectProjectAddress')
            var jsonUrl = selectProjectAddress.data.url.replace('/lookup', '/json')

            setTimeout(initData, 600)

            function getAddressItems () {
              // fetch data based on address
              window.fetch(jsonUrl + '?' + new URLSearchParams({
                $where: "address = '" + context.data.blocklot.selectProjectAddress + "' and parcel_number IS NOT NULL",
                $limit: 100,
                $select: 'address,address_number,address_number_suffix,street_name,street_type,unit_number,block,lot,zip_code',
                $order: 'address ASC, lot ASC'
              }))
                .then(response => response.json())
                .then(respData => {
                  if (respData && respData.status === 'success' && respData.data && respData.data.items && respData.data.items.length > 0) {
                    var dataItems = respData.data.items
                    processAddressItems(dataItems)

                    context.instance.triggerChange()
                  } else {
                    // showError('NOT_FOUND');
                  }
                }).catch((error) => {
                  console.log(error)
                })
            }

            function processAddressItems (addressItems) {
              // stores address data and pre-populate fields
              setValue('projectAddressDataItems', JSON.stringify(addressItems))
              updateAddressFields(addressItems[0])
              setValue('lookupBlockNumber', addressItems[0].block)
              setValue('lookupLotNumber', addressItems[0].lot)
            }

            function updateAddressFields (addressItem) {
              // update project address fields with address data
              var map = {
                address: 'projectAddress',
                address_number: 'projectAddressNumber',
                address_number_suffix: 'projectAddressNumberSuffix',
                street_name: 'projectAddressStreetName',
                street_type: 'projectAddressStreetType',
                unit_number: 'projectAddressUnitNumber',
                block: 'projectAddressBlock',
                lot: 'projectAddressLot',
                zip_code: 'projectAddressZip'
              }
              for (var prop in map) {
                var value = ''
                if (Object.prototype.hasOwnProperty.call(addressItem, prop)) value = addressItem[prop]
                setValue(map[prop], value)
              }
            }

            function initData () {
              // initialize data if the address has changed
              var data = context.data.blocklot
              if (data.selectProjectAddress !== data.projectAddress) {
                updateAddressFields({})
                if (data.selectProjectAddress) {
                  getAddressItems()
                } else {
                  context.instance.triggerChange()
                }
              }
            }
            function setValue (key, value) {
              // set data value and dom for a specific component
              var comp = context.utils.getComponent(context.form.components[0].components, key)
              var el = document.querySelector('#' + comp.id + ' input')
              if (el) {
                el.value = value
                context.data.blocklot[key] = value
              } else {
                console.log('Cannot setValue of component ' + key)
              }
            }
          },
          key: 'projectAddressData',
          type: 'hidden',
          input: true,
          tableView: false,
          hideOnChildrenHidden: false
        },
        {
          label: 'Project Address Data Items',
          persistent: false,
          customDefaultValue: '',
          key: 'projectAddressDataItems',
          type: 'hidden',
          input: true,
          tableView: false
        },
        {
          label: 'Columns',
          columns: [
            {
              components: [
                {
                  label: 'Block number',
                  disabled: true,
                  tableView: true,
                  key: 'lookupBlockNumber',
                  type: 'textfield',
                  input: true,
                  hideOnChildrenHidden: false
                }
              ],
              width: 6,
              offset: 0,
              push: 0,
              pull: 0,
              size: 'md'
            },
            {
              components: [
                {
                  label: 'Lot number',
                  disabled: true,
                  tableView: true,
                  redrawOn: 'projectAddressData',
                  customDefaultValue: (context) => {
                    var data = context.data.blocklot
                    if (data.projectAddressDataItems) {
                      var dataItems = JSON.parse(data.projectAddressDataItems)
                      if (dataItems.length) {
                        return dataItems[0].lot
                      }
                    }
                  },
                  key: 'lookupLotNumber',
                  customConditional: (context) => {
                    return context.form.components[0].conditionalLots(context, lots => lots.length === 1, true)
                  },
                  type: 'textfield',
                  input: true,
                  hideOnChildrenHidden: false
                }
              ],
              width: 6,
              offset: 0,
              push: 0,
              pull: 0,
              size: 'md'
            }
          ],
          tableView: false,
          key: 'columns',
          type: 'columns',
          input: false
        },
        {
          label: 'HTML',
          tag: 'div',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: '<p class="bg-green-2 p-1">We found the block and lot number for your address</p>',
          refreshOnChange: false,
          tableView: false,
          key: 'htmlBlockLotSingle',
          customConditional: (context) => {
            return context.form.components[0].conditionalLots(context, lots => lots.length < 2)
          },
          type: 'htmlelement',
          input: false
        },
        {
          label: 'HTML',
          tag: 'div',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: '<p class="bg-blue-2 p-1">We found the block number for your address but your address has more than 1 lot number.</p>',
          refreshOnChange: false,
          tableView: false,
          key: 'html1',
          customConditional: (context) => {
            return context.form.components[0].conditionalLots(context, lots => lots.length > 1)
          },
          type: 'htmlelement',
          input: false
        },
        {
          label: 'Choose the lot number of your project',
          optionsLabelPosition: 'right',
          inline: false,
          tableView: false,
          defaultValue: 'none',
          values: [
            {
              label: '',
              value: 'none',
              shortcut: ''
            }
          ],
          dataType: 'string',
          customDefaultValue: (context) => {
            var data = context.data.blocklot
            var _ = context._
            if (data.projectAddressDataItems) {
              var dataItems = JSON.parse(data.projectAddressDataItems)
              var lotValues = _.map(dataItems, function (x) {
                return { label: x.lot, value: x.lot }
              })
              lotValues = _.sortBy(lotValues, [function (o) { return o.label }, 'label'])
              context.instance.component.values = lotValues

              if (!context.data.blocklot.chooseLotNumber || _.indexOf(lotValues.map(x => x.value), context.data.blocklot.chooseLotNumber) < 0) {
                // setting default value
                var lotValue = lotValues[0].value
                context.value = lotValue
                context.data.blocklot.chooseLotNumber = lotValue
              }
              context.instance.triggerRedraw()
            }
          },
          key: 'chooseLotNumber',
          customConditional: (context) => {
            return context.form.components[0].conditionalLots(context, lots => lots.length > 1)
          },
          type: 'radio',
          input: true
        },
        {
          label: 'HTML',
          tag: 'div',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: '<p>If you do not know the lot number of your project, look it up in <a href="https://sfplanninggis.org/pim/" target="_blank">our property information map</a>.</p> <p>If your project has more than 1 block or lot, tell your permit tech after we email you.</p>',
          refreshOnChange: false,
          tableView: false,
          key: 'htmlBlockLotMulti',
          customConditional: (context) => {
            return context.form.components[0].conditionalLots(context, lots => lots.length > 1)
          },
          type: 'htmlelement',
          input: false
        },
        {
          label: 'HTML',
          attrs: [
            {
              attr: '',
              value: ''
            }
          ],
          content: 'Block and lot numbers are combined as parcel number (block/lot)',
          refreshOnChange: false,
          tableView: false,
          key: 'html',
          type: 'htmlelement',
          input: false
        },
        {
          legend: 'Project Address Data Fields (Hidden fields)',
          tableView: false,
          key: 'fieldsetProjectAddress',
          type: 'fieldset',
          label: '',
          input: false,
          components: [
            {
              label: 'Project Address',
              disabled: true,
              tableView: true,
              key: 'projectAddress',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Number',
              disabled: true,
              tableView: true,
              key: 'projectAddressNumber',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Number Suffix',
              disabled: true,
              tableView: true,
              key: 'projectAddressNumberSuffix',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Street Name',
              disabled: true,
              tableView: true,
              key: 'projectAddressStreetName',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Street Type',
              disabled: true,
              tableView: true,
              key: 'projectAddressStreetType',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Unit Number',
              disabled: true,
              tableView: true,
              key: 'projectAddressUnitNumber',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Block',
              disabled: true,
              tableView: true,
              key: 'projectAddressBlock',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Lot',
              disabled: true,
              tableView: true,
              redrawOn: 'chooseLotNumber',
              calculateValue: (context) => {
                var data = context.data.blocklot
                var lotValue = data.chooseLotNumber ? data.chooseLotNumber : data.lookupLotNumber
                return lotValue
              },
              key: 'projectAddressLot',
              type: 'textfield',
              input: true
            },
            {
              label: 'Project Address Zip',
              disabled: true,
              tableView: true,
              key: 'projectAddressZip',
              type: 'textfield',
              input: true
            }
          ]
        }
      ]
    }, ...extend)
  }

  get defaultSchema () {
    return Blocklot.schema()
  }

  static get builderInfo () {
    return {
      title: 'Block lot',
      icon: 'building',
      group: 'sfgov',
      schema: Blocklot.schema()
    }
  }
}
