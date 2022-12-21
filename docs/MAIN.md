# Onit-cli
Onit dev CLI utility

## Install

### From git repository
You can install onit-cli directly from git. Open a terminal session and type:

```
> git clone https://github.com/mitechsrl/onit-cli.git
> cd onit-cli
> npm install
> npm link
```

To update it, simply pull the changes from this repo.

### from npm
All onit-cli releases are also puched on npm.com.
Open a terminal session and type:

```
> npm install -g @mitech/onit-cli
```

## Commands 
Here's the list of main commands. For further docs, see the command-specific page.

- [onit serve](ONIT-SERVE.md), development serve command
- [onit doc](ONIT-DOC.md), documentation generation utility
- [onit build](ONIT-BUILD.md), app build utility
- [onit test](ONIT-TEST.md), automated test utility
- [onit labels](ONIT-LABELS.md), labels management utility
- [onit create](ONIT-CREATE.md), artifact creation utilities

## onit.config.js file
Commands **serve**, **test** and **build** requires a configuration file.

The tool search in the working directory the **onit.config.js** or **onit.config.json** files.

You can also create the files **onit.config.local.js** or **onit.config.local.json** which are intended to include sensitive data (or user ds-dependend data) which **should not be pushed on git repository**.

The tool will automatically merge the content of the local and non-local file when needed.

For more info, [see here a complete example of config file](./ONIT-CONFIG-EXAMPLE-FILE.md)

## Common flags
These flags can be applied to any command:


`-h` Add this flag to any command to show help without actually running the command.

`--log-to-file` Logs all the cli output to file while still displaying it to console. Useful in case of long running sessions for error logging.

`--verbose` Enable verbose output on commands which supports them.
