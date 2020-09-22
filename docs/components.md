## Components

This theme introduces several custom Formio components. There are two different
"flavors" of custom component:

* **Class components** are JavaScript classes that extend Formio's component
  classes and provide new or modified inputs and behaviors.

* **Component templates** are really just schema templates that we [define in
  the theme's builder options](../src/components/builder.js), and which are
  only available in the [Form.io portal bundle](../README.md#formio-portal).
  
## Review component
The [`review` class component](../src/components/review.js) displays all of the
values provided in the form's submission. Place it within the last panel (page)
of a wizard form so that it always reflects the most up-to-date submission
data.

## Address component
This [class component](../src/components/address.js) replaces Formio's built-in
`address` component and renders a group of inputs for street, city,
[state](#state-component), and [ZIP code](#zip-component).

## State component
The [`state` component](../src/components/state.js) renders a `<select>`
dropdown of U.S. states defined in [data/states.json](../data/states.json).

## ZIP code component
The [`zip` component](../src/components/zip.js) renders a ZIP code text input
that validates either a 5-digit number or a ZIP+4 pattern (5 numbers followed
by a dash and 4 more, e.g. `94110-1234`).

## Full name component
This component template provides a container component with the default key
`name`, and `first` and `last` child text fields in a 2-column grid.
