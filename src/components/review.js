const { field: Field } = window.Formio.Components.components

const skipComponentTypes = [
  'content',
  'htmlelement',
  'panel',
  'review'
]

export default class Review extends Field {
  static schema (...extend) {
    return Field.schema({
      type: 'review',
      key: 'review',
      label: 'Review your submission',
      hideLabel: false,
      tableView: false,
      persistent: false
    }, ...extend)
  }

  get defaultSchema () {
    return Review.schema()
  }

  get templateName () {
    return 'review'
  }

  render (children) {
    const components = []
    const { submission } = this.root.form

    this.root.everyComponent(comp => {
      if (this.isDisplayableComponent(comp)) {
        components.push(comp)
      }
    })

    if (this.isIntroPage(components[0])) {
      components.shift()
    }

    if (this.isReviewPage(components[components.length - 1])) {
      components.pop()
    }

    return super.render(
      this.renderTemplate(this.templateName, {
        components,
        submission,
        children
      })
    )
  }

  isDisplayableComponent (component) {
    return !skipComponentTypes.includes(component.type)
  }

  isIntroPage (component) {
    return component.type === 'components'
  }

  isReviewPage (component) {
    return component.type === 'components' &&
      component.components.some(child => child.type === 'review')
  }

  attach (element) {
    this.loadRefs(element, {
      editLinks: 'multiple'
    })

    this.refs.editLinks.forEach(input => {
      this.addEventListener(input, 'click', () => {
        this.root.focusOnComponent(input.getAttribute('data-key'))
      }, { once: true })
    })

    return super.attach(element)
  }
}
