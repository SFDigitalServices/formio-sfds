import values from '../../data/states.json'

const { select: Select } = window.Formio.Components.components

export default class StateSelect extends Select {
  static schema (rest = {}) {
    return Select.schema({
      // these are schema fields that should be overridden
      key: 'state',
      ...rest,
      // and these are ones that should not be
      widget: 'html5',
      dataSrc: 'values',
      data: { values },
      valueProperty: 'code',
      template: '{{ item.name }}'
    })
  }

  get defaultSchema () {
    return StateSelect.schema()
  }
}
