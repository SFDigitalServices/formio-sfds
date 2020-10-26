import states from '../../data/states.json'

const { select: Select } = window.Formio.Components.components

export default class StateSelect extends Select {
  static schema (...extend) {
    return Select.schema({
      // these are schema fields that should be overridden
      key: 'state',
      widget: 'html5',
      dataSrc: 'values',
      lazyLoad: false,
      template: '{{ item.label }}',
      data: {
        values: states
      }
    }, ...extend)
  }

  get defaultSchema () {
    return StateSelect.schema()
  }

  static get builderInfo () {
    return {
      title: 'U.S. State',
      icon: 'map-marker',
      group: 'sfgov',
      schema: StateSelect.schema()
    }
  }
}
