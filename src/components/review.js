const { FormioUtils } = window
const { field: Field } = window.Formio.Components.components

const skipComponentTypes = [
  'content',
  'columns',
  'container',
  'fieldset',
  'htmlelement',
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

  static get builderInfo () {
    return {
      title: 'Review submission',
      icon: 'list-ul',
      group: 'sfgov',
      schema: Review.schema()
    }
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
    if (first && this.isIntroPage(first)) {
      components.shift()
    }

    const last = components[components.length - 1]
    if (last && this.isReviewPage(last)) {
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
    return !skipComponentTypes.includes(component.type) &&
      !skipComponentTypes.includes(component.component.type)
  }

  isIntroPage (component) {
    return component.component.type === 'panel' &&
      this.everyComponentSatisfies(component.components, c => {
        return !this.isDisplayableComponent(c)
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
      setPage: 'multiple',
      focusInput: 'multiple'
    })

    this.refs.setPage.forEach(button => {
      this.addEventListener(button, 'click', () => {
        const key = button.getAttribute('data-key')
        const index = this.root.getPageIndexByKey(key)
        this.root.setPage(index)
      }, { once: true })
    })

    this.refs.focusInput.forEach(button => {
      this.addEventListener(button, 'click', () => {
        const key = button.getAttribute('data-key')
        this.root.focusOnComponent(key)
      }, { once: true })
    })

    return super.attach(element)
  }
}
