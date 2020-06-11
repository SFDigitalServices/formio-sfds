import values from '../../data/states.json'

const { select: Select } = window.Formio.Components.components

export default class StateSelect extends Select {
  static schema (...extend) {
    return Select.schema({
      // these are schema fields that should be overridden
      key: 'state',
      widget: 'html5',
      dataSrc: 'values',
      data: { values },
      valueProperty: 'code',
      template: '{{ item.name }}'
    }, ...extend)
  }

  get defaultSchema () {
    return StateSelect.schema()
  }
}
