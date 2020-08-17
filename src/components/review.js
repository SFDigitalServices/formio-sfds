const { component: Components } = window.Formio.Components.components

const skipComponents = ["htmlelement", "review"];

export default class Review extends Components {
  static schema (...extend) {
    return Components.schema({
      type: 'review',
      label: 'Review your submission',
      key: 'review',
      hideLabel: true,
      tableView: true,
	  persistent: false,
    }, ...extend)
  }  

  get defaultSchema () {
    return Review.schema()
  }

  get templateName () {
    return 'review'
  }
  
  render(children) {
	const components = [];
	const { submission } = this.root.form;
	this.root.everyComponent((comp) => {
	  if (!skipComponents.includes(comp.type)) {
		components.push(comp);
	  }
	});
	//remove the first and last pages, the intro and review pages respectively
	if (components[0].type == "components" && components[0].component.hideLabel == false) components.shift();
	if (components[components.length - 1].type == "components" && components[components.length - 1].component.hideLabel == false) components.pop();	
	return this.renderTemplate("review", {
	  components,
	  submission
	});
  }
  
  attach(element) {
	  this.loadRefs(element, {
		  editLinks: 'multiple',
	  })
      this.refs.editLinks.forEach(input => {
        this.addEventListener(input, 'click', () => this.root.setPage(this.root.getPageIndexByKey(input.dataset.key)))
      });	  
  }
}
