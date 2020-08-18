const { container: Container } = window.Formio.Components.components

export default class Blocklot extends Container {
  static schema (...extend) {
    return Container.schema({
      // these are schema fields that should be overridden
      key: 'blocklot',
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
          customDefaultValue: "console.log('data default');\nvar selectProjectAddress = utils.getComponent(form.components, 'selectProjectAddress');\nvar jsonUrl = selectProjectAddress.data.url.replace('/lookup', '/json')\n//initData();\nsetTimeout(initData, 600);\n\n\n\nfunction getAddressItems(){\n  value.numResults = 0;\n  fetch(jsonUrl + '?'+ new URLSearchParams({\n    $where: \"address = '\"+data.selectProjectAddress+\"' and parcel_number IS NOT NULL\",\n    $limit: 100,\n    $select: \"address,address_number,address_number_suffix,street_name,street_type,unit_number,block,lot,zip_code\"\n}))\n  .then(response => response.json())\n  .then(respData => {\n    if(respData && respData.status == \"success\" && respData.data && respData.data.items && respData.data.items.length > 0){\n        console.log('ok');\n        dataItems = respData.data.items;\n        value.numResults = dataItems.length;\n        processAddressItems(dataItems);\n        \n        //var projectAddressItems = utils.getComponent(form.components, 'projectAddressItems');\n        //console.log(projectAddressItems);\n        \n        \n        //data.projectAddressItems = JSON.stringify(dataItems);\n        //console.log(data.projectAddressItems)\n\n        \n        \n        instance.triggerChange();\n        \n    }else{\n      //showError('NOT_FOUND');\n    }\n    \n  }).catch((error) => {\n   console.log(error);\n  }).finally(() => {\n    //instance.triggerChange();\n  });\n}\n\nfunction processAddressItems(addressItems){\n  setValue('projectAddressDataItems', JSON.stringify(addressItems));\n  console.log('processAddressItems');\n  updateAddressFields(addressItems[0]);\n  setValue('lookupBlockNumber', addressItems[0]['block']);\n  setValue('lookupLotNumber', addressItems[0]['lot']);\n}\n\nfunction updateAddressFields(addressItem){\n  var map = {\n    'address': 'projectAddress',\n    'address_number': 'projectAddressNumber',\n    'address_number_suffix': 'projectAddressNumberSuffix',\n    'street_name': 'projectAddressStreetName',\n    'street_type': 'projectAddressStreetType',\n    'unit_number': 'projectAddressUnitNumber',\n    'block': 'projectAddressBlock',\n    'lot': 'projectAddressLot',\n    'zip_code': 'projectAddressZip'\n  }\n  for(var prop in map){\n    var value = '';\n    if(addressItem.hasOwnProperty(prop)) value = addressItem[prop];\n    setValue(map[prop], value);\n  }\n}\n\nfunction initData(){\n  console.log('init data');\n  if(data.selectProjectAddress != data.projectAddress){\n    updateAddressFields({});\n    if(data.selectProjectAddress){\n      getAddressItems();\n    }else{\n      instance.triggerChange();\n    }\n  }\n}\nfunction setValue(key, value){\n  var comp = utils.getComponent(form.components, key);\n  var el = document.querySelector('#'+comp.id+' input');\n  if(el){\n    el.value = value;\n    data[key] = value;\n  }else{\n    console.log('Cannot setValue of component '+key);\n  }\n}",
          key: 'projectAddressData',
          type: 'hidden',
          input: true,
          tableView: false,
          hideOnChildrenHidden: false
        },
        {
          label: 'Project Address Data Items',
          persistent: false,
          customDefaultValue: "function refresh(){\n  console.log('refreshing... '+data.projectAddressDataItems);\n  instance.triggerChange();\n}\n//setInterval(refresh, 3000);",
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
                  redrawOn: 'projectAddressDataItems',
                  calculateValue: "console.log('lot number is updating');",
                  key: 'lookupLotNumber',
                  customConditional: 'show = true;\nif(data.projectAddressDataItems){\n  var numLots = JSON.parse(data.projectAddressDataItems).length;\n  if(numLots > 1){\n    show = false;\n  }\n}',
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
          customConditional: 'show = false;\nif(data.projectAddressDataItems){\n  var numLots = JSON.parse(data.projectAddressDataItems).length;\n  if(numLots < 2){\n    show = true;\n  }\n}',
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
          customConditional: 'show = false;\nif(data.projectAddressDataItems){\n  var numLots = JSON.parse(data.projectAddressDataItems).length;\n  if(numLots > 1){\n    show = true;\n  }\n}',
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
          customDefaultValue: "if(data.projectAddressDataItems){\n  dataItems = JSON.parse(data.projectAddressDataItems);\n  lotValues = _.map(dataItems, function(x){\n          return {\"label\":x.lot, \"value\":x.lot}\n        });\n  lotValues = _.sortBy(lotValues, [function(o){ return o.label; }, 'label'])\n  instance.component.values = lotValues;\n  value = lotValues[0][\"value\"];\n  instance.triggerRedraw();\n  console.log(instance);\n  console.log(lotValues);\n}",
          key: 'chooseLotNumber',
          customConditional: 'show = false;\nif(data.projectAddressDataItems){\n  var numLots = JSON.parse(data.projectAddressDataItems).length;\n  if(numLots > 1){\n    show = true;\n  }\n}',
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
          content: '<p>If you do not know the lot number of your project, look it up in <a href="https://sfplanninggis.org/pim/" target="_blank">our property information map</a>.</p>\n<p>If your project has more than 1 block or lot, tell your permit tech after we email you.</p>',
          refreshOnChange: false,
          tableView: false,
          key: 'htmlBlockLotMulti',
          customConditional: 'show = false;\nif(data.projectAddressDataItems){\n  var numLots = JSON.parse(data.projectAddressDataItems).length;\n  if(numLots > 1){\n    show = true;\n  }\n}',
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
