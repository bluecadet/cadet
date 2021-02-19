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
- run `cadet setup-project`
- commit changes
- verify config directory in settings.php
- run `drush cex` and commit changes
- run `cadet new-theme` to create new FE theme
- TODO: run `cadet new-theme` again if you want to create a specific BE theme
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








## Set up your local development environment for an existing project
When starting local development on a new project...

- clone new github repo locally
- create new local DB (rememeber the name of the DB)
- run `cadet pull --init`
- run `cadet pull` and pull db only
- run `composer install`
- run `npm install`
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
