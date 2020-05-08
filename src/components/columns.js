const { columns: Columns } = window.Formio.Components.components

export default class CustomColumns extends Columns {
  get columnKey () {
    return `column-${this.component.id}`
  }
}
