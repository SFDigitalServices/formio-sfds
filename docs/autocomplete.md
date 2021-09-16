---
title: Autocomplete components
---

This theme _disables_ the default autocomplete functionality of formio.js's
built-in [select component] and only enables it if the component has an
`autocomplete` tag in the "Field tags" input of the "API" tab on the form.io
portal:

![](https://help.form.io/assets/img/api1.png)

## Translation
We patch the `customOptions` of every autocomplete component at runtime to
include translated (or, at least, translatable) UI strings with predictable
keys that can be customized either globally (all autocomplete components in a
single form) or for each instance. These are the options that [Choices.js] lets
us localize:

| Option | English | Notes
:--- | :--- | :---
[`searchPlaceholderValue`](https://github.com/jshjohnson/Choices#searchplaceholdervalue) | "Type to search" |  The placeholder text of the search input
[`noResultsText`](https://github.com/jshjohnson/Choices#noresultstext) | "No results found" | 
[`itemSelectText`](https://github.com/jshjohnson/Choices#itemselecttext)  | _none_ | Displayed on the right side of the dropdown alongside the currently highlighted option
[`maxItemText`](https://github.com/jshjohnson/Choices#maxitemtext)  | <nobr>"Only {{count}} values can be added"</nobr> | The `{{count}}` placeholder is substituted with the [maxItemCount](https://github.com/jshjohnson/Choices#maxitemcount) option.
[`noChoicesText`](https://github.com/jshjohnson/Choices#nochoicestext)  | "No choices to choose from" | This should only show up if we haven't provided any static options or have a dynamic select driven by an API that doesn't return any results.
[`addItemText`](https://github.com/jshjohnson/Choices#additemtext)  | _none_ | ⚠️ I **think** that this option is only applicable when freeform values are allowed. If so, this shows up when you've typed a search string as a prompt, e.g. "Press Enter to add **{{value}}**", where `{{value}}` is substituted with the "backend" value of the option.

The default translations for the `autocomplete.*` keys live in this repo's
[i18n directory].

[select component]: https://help.form.io/userguide/form-components/#select
[choices.js]: https://github.com/jshjohnson/Choices#readme
[i18n directory]: https://github.com/SFDigitalServices/formio-sfds/tree/main/src/i18n
