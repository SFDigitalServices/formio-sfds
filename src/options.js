export default {
  builder: {
    premium: false,
    sfds: {
      title: 'SFDS fields',
      weight: 90,
      components: {
        name: {
          title: 'Name',
          schema: {
            type: 'container',
            label: 'Name',
            key: 'name',
            tableView: true,
            components: [
              {
                type: 'textfield',
                key: 'first',
                label: 'First name'
              },
              {
                type: 'textfield',
                key: 'last',
                label: 'Last name'
              }
            ]
          }
        }
      }
    }
  },
  editForm: {
  }
}
