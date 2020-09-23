## Localization
We use [Phrase] to manage translations of both "generic" form strings and
content specific to each form. There are a couple of different workflows to be
aware of:

### Translate generic strings (content)
1. Translate the strings in the [generic strings Phrase project](https://app.phrase.com/accounts/city-county-of-san-francisco/projects/form-io-generic-strings)
1. Ask somebody with access to this repo to pull the new translations (see below)

### Update generic string translations (engineering)
1. Check out this repo
1. Set `PHRASE_ACCESS_TOKEN` in your local environment
1. Run `script/phrase pull` to get the new strings
1. If `git diff src/i18n` shows a diff, then commit the changes and make a new release

### Translate a form
This workflow is done almost entirely in either [Phrase] or the [Phrase
in-context editor]:

1. Set the `phraseProjectId` custom property of your form on form.io to your
   Phrase project ID
1. Visit `https://formio-sfds.vercel.app/api/strings?formUrl=<URL>`, where
   `<URL>` is your form.io data source URL
1. Save the JSON to your computer
1. Upload the JSON to your Phrase project
1. Log in to sf.gov
1. Visit the form on sf.gov and add `?translate=true` at the end of the URL
1. When the form loads, you should see a modal dialog to log in to Phrase

Once you've logged in, you should see a blue bar across the bottom and pencil
icon markers above each piece of translatable form content:

![Phrase in-context editor screenshot](https://user-images.githubusercontent.com/113896/88839471-f3db8580-d18f-11ea-8121-e0ce158ca274.png)

Each batch of translations can be bundled together in a "release" by adding or
updating the form's `phraseProjectVersion` custom property, ideally using
[semantic versioning conventions](https://semver.org).

[Phrase]: https://phrase.com
[Phrase in-context editor]: https://help.phrase.com/help/set-up-in-context-editor
