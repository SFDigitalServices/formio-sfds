import values from '../../data/states.json'

const { select: Select } = window.Formio.Components.components

export default class StateSelect extends Select {
  static schema (...extend) {
    return Select.schema({
      // these are schema fields that should be overridden
      key: 'state',
      widget: 'html5',
      label: 'State',
      dataSrc: 'values',
      data: { values },
      valueProperty: 'code',
      template: '{{ item.name }}'
    }, ...extend)
  }

  static get builderInfo () {
    return {
      title: 'U.S. state',
      group: 'sfds',
      schema: StateSelect.schema()
    }
  }

  get defaultSchema () {
    return StateSelect.schema()
  }
}
