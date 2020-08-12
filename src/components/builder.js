const fullName = {
  title: 'Full name',
  icon: 'user',
  schema: {
    type: 'container',
    label: 'Name',
    key: 'name',
    tableView: true,
    components: [
      {
        label: 'First name',
        key: 'first',
        type: 'textfield'
      },
      {
        label: 'Last name',
        key: 'last',
        type: 'textfield'
      }
    ]
  }
}

export default {
  fullName
}
