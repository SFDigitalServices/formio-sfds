import { SFGovForm, SFGovFormData } from './elements'

const { location, FormioSFDS } = window

const params = new URLSearchParams(location.search)
for (const [key, value] of params.entries()) {
  FormioSFDS.options[key] = value
}

SFGovForm.register()
SFGovFormData.register()
