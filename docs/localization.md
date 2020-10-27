# Localization
We use [Phrase] to manage translations of both "generic" form strings and
content specific to each form. There are a couple of different workflows to be
aware of:

- [Translate generic strings](#translate-generic-strings-content)
- [Update generic string translations](#update-generic-string-translations-engineering)
- [Translate a specific form](#translate-a-form)

## Translate generic strings (content)
1. Translate the strings in the [generic strings Phrase project](https://app.phrase.com/accounts/city-county-of-san-francisco/projects/form-io-generic-strings)
1. Ask somebody with access to this repo to pull the new translations (see below)

## Update generic string translations (engineering)
1. Install the [Phrase CLI tools](https://phrase.com/cli/)
1. Check out this repo
1. Set `PHRASE_ACCESS_TOKEN` in your local environment (i.e. in `.env`)
1. Run `script/phrase pull` to get the new strings
1. If `git diff src/i18n` shows a diff, then commit the changes and [publish a new release](../develop.md#publishing)


## Translate a form
Before you can translate a form, you'll need to do some one-time setup in both Phrase and the form.io portal:

### Phrase setup
1. Create a new Phrase project in the [SF Digital Services workspace](https://app.phrase.com/accounts/city-county-of-san-francisco/spaces)
1. Open the <kbd>More ⌄</kbd> menu in the project navigation and select <kbd>Project Settings</kbd>

    <img src="https://user-images.githubusercontent.com/113896/97355318-fbc0c980-1853-11eb-8559-a527798562de.png" height="400" alt="image of the More and Project Settings navigation">

1. Select the <kbd>API</kbd> menu item on the left, and copy the Project ID:

    ![image of the Project ID field](https://user-images.githubusercontent.com/113896/97355530-44788280-1854-11eb-8db4-2d0534d9897d.png)

### Form.io setup
1. Edit your form in the [form.io portal](https://portal.form.io), and 
1. Click the gear icon in the form navigation to edit its settings:

    ![image of the gear icon in form.io project settings](https://user-images.githubusercontent.com/113896/97355914-dbddd580-1854-11eb-89bb-fde9cc30cebe.png)

1. In the <kbd>Custom Properties</kbd> section, add a new entry with `phraseProjectId` in the "Key" field and the Phrase project ID that you copied in the "Value" field:

    ![image of the custom properties in form.io](https://user-images.githubusercontent.com/113896/88114083-fa527780-cb67-11ea-98a1-b85273db617a.png)
   
1. Visit `https://formio-sfds.vercel.app/api/strings?formUrl=<URL>`, where
   `<URL>` is your form.io data source URL
1. Save the JSON to your computer
1. Upload the JSON to your Phrase project:

  - Under the <kbd>More ⌄</kbd> menu, select <kbd>Upload file</kbd>
  - Click <kbd>Choose file</kbd> and find the JSON file that you just saved
  - Choose `i18next (.json)` from the <kbd>Format</kbd> menu
  - Under <kbd>Language</kbd>, type `en` in the field under <kbd>Use existing language</kbd>

      <img src="https://user-images.githubusercontent.com/113896/97367482-6da20e80-1866-11eb-9b0a-5e6b86e5aabe.png" width="350">

  - Click the <kbd>Upload</kbd> button
  - Confirm that strings were loaded and click on <kbd>Translate imported keys</kbd> to view them:

      ![image](https://user-images.githubusercontent.com/113896/97367809-00db4400-1867-11eb-8115-dca7ca108504.png)

1. Visit `https://formio-sfds.vercel.app/api/translate?url=<URL>`, where
   `<URL>` is the URL of your form _on sf.gov_
1. When the form loads, you should see a modal dialog to log in to Phrase

Once you've logged in, you should see a blue bar across the bottom and pencil
icon markers above each piece of translatable form content:

![Phrase in-context editor screenshot](https://user-images.githubusercontent.com/113896/88839471-f3db8580-d18f-11ea-8121-e0ce158ca274.png)

Each batch of translations can be bundled together in a "release" by adding or
updating the form's `phraseProjectVersion` custom property (in the same place
that you added `phraseProjectId` above). Please use [semantic versioning
conventions](https://semver.org) to track the types of changes:

* Patch versions (`1.0.0` → `1.0.1`) for translation updates and other "fixes", like spelling
* Minor versions (`1.0.1` → `1.1.0`) when new keys and/or translations are added
* Major versions (`1.0.0` → `2.0.0`) when keys are deleted

When in doubt, drop into **#topic-translations** and ask for help! 💪

[Phrase]: https://phrase.com
[Phrase in-context editor]: https://help.phrase.com/help/set-up-in-context-editor
