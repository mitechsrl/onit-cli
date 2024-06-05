# onit labels

Labels management utility

## onit labels dup

Scan the project directory searching for labels json files. These files are then processed to remove duplicates.

## onit labels translate

Scan the current directory for labels file and translate them. Translations are performed using a cloud services, of which **google translate** and **microsoft translate** are supported.

A valid subscription for the selected service is required. Refer to respective services on how to get it.

Also, a translator configuration is needed. Please refer to the **configuration** section below.

## onit labels translate services

List configured translation services

## onit labels translate services add

Add a translation service configuration.

## onit labels translate services delete

Deletes a translation service configuration.

## Configuration

The translation tool needs a configuration object in your **onit.config.js file**

```js
{
    // translate configuration section
    translate: {
        // replace these words before translating 
        synomns: [
            // replaces hi with hello
            { word: 'hi', syn: 'hello' },
        ],
        // do not translate these labels (exact-text match, like /^Error$/)
        skip: [
            'Error'
        ],
        // destination language codes. Default to ['en_GB','de_DE','fr_FR','es_ES']
        languages: ['de_DE','fr_FR']
    }
}
