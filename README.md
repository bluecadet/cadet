# 👨‍🚀 Cadet 🚀


## Installation

```
npm install -g @bluecadet/cadet
```

## Requirements
- Node v12+
- MAMP

## Commands Quick Links

- [`setup-project`](#setup-project)
- [`setup-local`](#setup-local)
- [`new-theme`](#new-theme)
- [`pull`](#pull)
- [`ci-update`](#ci-update)
- [`github-label`](#github-label)


## Usage

### When onboarding to an existing project

- Clone github repo locally
- Fire up MAMP, create new local site and database
- If using MAMP and a project with a nested webroot (usually `web`), point MAMP to the webroot
- Run `cadet setup-local`
- Run `cadet pull`
- Run `composer install`
- Run `npm install`
- There should be nothing to commit, and site should be ready to go! 🚀


### When starting a new project

- run `terminus build:project:create ...`
  - Login to terminus with bc-bot@bluecadet.com account
  - D8: `terminus build:project:create --team="Bluecadet" --org="bluecadet" --email="bc-bot@bluecadet.com" --admin-email="bc-bot@bluecadet.com" --visibility="private" d8 [PROJECT_NAME]`
  - WP: `terminus build:project:create --team="Bluecadet" --org="bluecadet" --email="bc-bot@bluecadet.com" --admin-email="bc-bot@bluecadet.com" --visibility="private" wp [PROJECT_NAME]`
  - switch terminus user back to your personal account
- clone new github repo locally
- fire up MAMP, create new local site and database
- run `cadet setup-project`
- commit changes
- **Drupal:** verify config directory in settings.php
- **WordPress:** update `WP_HOME` and `WP_SITEURL` definitions in `wp-config-local.php`
- run `cadet pull`
- **Drupal:** run `drush cex` and commit changes
- run `cadet new-theme` to create new FE theme
  - *PRESS SPACEBAR TO SELECT ONE OR MORE THEMES, then enter to confirm*
- commit changes
- run `cadet ci-update --incTestConfig` to add the latest ci files and changes and base test files
- commit changes

- TODO: Setup RaspberryPi with stuff.....
  - Once connected to the Bluecadet Network, office or VPN.
  - SSH into the raspi, `ssh pi@[IP ADDRESS]`
    - Ask Pete for the IP Address.
  - Don't think to hard about the password.
  - run `crontab -l` to get familiar with what we will be doing. We typically want to run daily tasks on each environment. Feel free to run as many different commands, but please keep blocks together in each project.
  - cd to /usr/local/bin where we store all the scripts, `cd /usr/local/bin`
  - copy "proj-template" folder, `sudo cp -r proj-template/ [PROJECT NAME]`
  - edit files inside your new project directory. All Actions are commented out. Add what you need.
    - `cd [PROJECT NAME]`
    - `sudo nano dev-daily` and repeat for all files...
  - Add new commands to the crontab
    - `crontab -e`
    - create a new block of code and list your project with a comment.
    - Try to spread out your tasks so not everything runs at once.
    - Make sure to use a unique log file for your project.
    - should look something like:

    ```
    # [PROJECT_NAME]
    # contact: [your name] [your email]
    10 1 * * * /usr/local/bin/[PROJECT_NAME]/dev-daily >> /home/pi/Documents/cron-[PROJECT_NAME].log 2>&1
    5 1 * * * /usr/local/bin/[PROJECT_NAME]/test-daily >> /home/pi/Documents/cron-[PROJECT_NAME].log 2>&1
    0 1 * * * /usr/local/bin/[PROJECT_NAME]/live-daily >> /home/pi/Documents/cron-[PROJECT_NAME].log 2>&1
    45 1 * * * /usr/local/bin/[PROJECT_NAME]/copy-down-daily >> /home/pi/Documents/cron-[PROJECT_NAME].log 2>&1
    ```

    - in order to test your commands run `/usr/local/bin/[PROJECT_NAME]/dev-daily` and check the output
    - if you saved the crontab correctly, you should see `crontab: installing new crontab`.


## Commands Overview

### `setup-project`
```
$ cadet setup-project
```

Use when starting a new project. (Should only be ran once per project)

Features:
- Setup Github credentials
- Setup Pantheon credentials
- Setup Circle CI if applicable
- Alter .gitignore for CMS specific build
- D8:
  - Add composer packages
  - Setup Pantheon workflows
- WP
  - Add composer packages
  - Add wp-config.php
- Runs `setup-local`


### `setup-local`
```
$ cadet setup-local
```

Use when onboarding to an existing project that uses cadet. Creates local files for development.

Features:
- Setup Github credentials
- Setup Pantheon credentials
- D8:
  - Add local dev files
- WP
  - Add local dev files


### `new-theme`
```
$ cadet new-theme
```

Creates new themes in a Drupal or WordPress project. MULTIPLE OPTIONS CAN BE SELECTED, USE SPACEBAR TO SELECT IN THE PROMPT.

Features:
- Themes from [BC Base Themes](https://github.com/bluecadet/bc-base-themes)



### `pull`
```
$ cadet pull
$ cadet pull --exclude=...
$ cadet pull --force|-f
```

Pull database and/or files from a Pantheon source into project.


#### Options:

`--exclude`:

Use this flag to exclude files or directories from being pulled. Seperate paths with using a comma.

```
$ cadet pull --exclude=private
$ cadet pull --exclude=private,public/not-this.jpeg
```

`--force -f`:

When pulling a database, cadet will look for a backup created within the past 'X' number of minutes, which is added during setup (and stored in the `bac_exp` value of `.cadet/local-db.json`)

Using the `--force` or `-f` flag will override the default value and force a new database backup to be created in Pantheon.


### `ci-update`
```
$ cadet ci-update
```

Update CI processes to a specific version. More to come...


### `github-label`
```
$ cadet github-label
```

Create commonly used GitHub labels in the project repo.






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
