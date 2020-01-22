# 👨‍🚀 Cadet 🚀


## Installation

```
npm install -g @bluecadet/cadet
```

## Usage

## Commands

[new-theme](./docs/new-theme.md)

## Instantiating a new Project

When starting off a new project...

- run `terminus build:project:create ...`
- clone new github repo locally
- create new local DB (rememeber the name of the DB)
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


## Installing a new Project locally
When starting local development on a new project...

- clone new github repo locally
- create new local DB (rememeber the name of the DB)
- run `cadet pull` and pull db only
- run `cadet new-site`
  - There should be nothing to commit, and site should be ready to go! 🚀


## Development notes

### Messaging Colors
- Interactives (QOA): `chalk.cyan('text')`
- Warning/Critical Interactives (QOA): `chalk.yellow.bold('text')`
- Status/Updates: `chalk.blue('text')` (when appropriate, use `...` before and after message)
- Process Complete, OK: `chalk.green('text')`
- Fail, Alert: `chalk.white.bgRed('text')`
- Warning: `chalk.yellow('text')`

