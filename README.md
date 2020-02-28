# 👨‍🚀 Cadet 🚀


## Installation

```
npm install -g @bluecadet/cadet
```

## Usage

## Commands

[new-theme](./docs/new-theme.md)

## Instantiate a new project and set up your local development environment

When starting off a new project...

- run `terminus build:project:create ...`
- clone new github repo locally
- create new local DB (rememeber the name of the DB)
- run `cadet pull --init`
- run `cadet pull` and pull db only
- run `cadet new-site`
- run `cadet init-site`
- commit changes
- run `drush cex` and commit changes
- run `cadet new-theme` to create new FE theme
- TODO: run `cadet new-theme` again if you want to create a specific BE theme
- commit changes
- run `cadet ci-update --incTestConfig` to add the latest ci files and changes and base test files
- commit changes
- TODO: Setup RaspberryPi with stuff.....


## Set up your local development environment for an existing project
When starting local development on a new project...

- clone new github repo locally
- create new local DB (rememeber the name of the DB)
- run `cadet pull --init`
- run `cadet pull` and pull db only
- run `cadet new-site`
- run `composer install`
  - There should be nothing to commit, and site should be ready to go! 🚀


## Troubleshooting
- If fractal isn't working and you get the error `Error: ENOENT: no such file or directory, scandir '[...]/node_modules/node-sass/vendor'`, run `node node_modules/node-sass/scripts/install.js` and `npm rebuild node-sass` (https://github.com/sass/node-sass/issues/1579#issuecomment-227661284)


## Development notes
### Messaging Colors
- Interactives (QOA): `chalk.cyan('text')`
- Warning/Critical Interactives (QOA): `chalk.yellow.bold('text')`
- Status/Updates: `chalk.blue('text')` (when appropriate, use `...` before and after message)
- Process Complete, OK: `chalk.green('text')`
- Fail, Alert: `chalk.white.bgRed('text')`
- Warning: `chalk.yellow('text')`
