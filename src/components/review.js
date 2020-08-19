const { FormioUtils } = window
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
      input: false
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

    const first = components[0]
    if (this.isIntroPage(first)) {
      components.shift()
    }

    const last = components[components.length - 1]
    if (this.isReviewPage(last)) {
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
    return component.component.type === 'panel' &&
      this.everyComponentSatisfies(component.components, c => {
        return !this.isDisplayableComponent(c.component)
      })
  }

  isReviewPage (component) {
    return component.component.type === 'panel' &&
      this.someComponentsSatisfy(component.components, c => c.component.type === 'review')
  }

  everyComponentSatisfies (components, test) {
    let satisfied = true
    FormioUtils.eachComponent(components, comp => {
      if (!test(comp)) {
        satisfied = false
        return true // prevent further recursion
      }
    }, true)
    return satisfied
  }

  someComponentsSatisfy (components, test) {
    let satisfied = false
    FormioUtils.eachComponent(components, comp => {
      if (test(comp)) {
        satisfied = true
        return true // prevent further recursion
      }
    })
    return satisfied
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
