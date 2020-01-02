let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');

const creds = require('../../utils/credentials.js');
const os = require('os');
const fsx = require('fs-extra');
const yaml = require('js-yaml');
const utils = require('../../utils/utils');
const compPackages = require('../../utils/packages/packages.js').PACKAGES;
const spawnSync = require('child_process').spawnSync;

function NewSiteD8(args) {
  this.args = args;
  this.args.cms = 'D8';

  this.newSiteSetup = () => {
    var dbSettings = creds.getLocalDbCreds();

    // Write/add settings.local.php file.
    var settingsLocalTxt = fsx.readFileSync(__dirname + "/src/settings.local.php.tpl").toString('utf-8');
    settingsLocalTxt = settingsLocalTxt.replace('DB_NAME_REPLACEMENT', dbSettings.db_name);
    settingsLocalTxt = settingsLocalTxt.replace('DB_USERNAMENAME_REPLACEMENT', dbSettings.db_user);
    settingsLocalTxt = settingsLocalTxt.replace('DB_PASSWORD_REPLACEMENT', dbSettings.db_pass);
    settingsLocalTxt = settingsLocalTxt.replace('DB_PREFIX_REPLACEMENT', dbSettings.db_prefix);
    settingsLocalTxt = settingsLocalTxt.replace('DB_HOST_REPLACEMENT', dbSettings.db_host);
    settingsLocalTxt = settingsLocalTxt.replace('DB_PORT_REPLACEMENT', dbSettings.db_port);

    let settingsLocalFile = "./web/sites/default/settings.local.php";
    fsx.outputFileSync(settingsLocalFile, settingsLocalTxt);

    log(chalk.yellow("settings.local.php file written"), 0);

    // Write/add local.services.yml.
    let servicesLocalFileTpl = __dirname + "/src/local.services.yml.tpl";
    let servicesLocalFile = "./web/sites/local.services.yml";
    fsx.copySync(servicesLocalFileTpl, servicesLocalFile);
    log(chalk.yellow("local.services.yml file written"), 0);

    // Copy .htaccess file to web folder.
    let htaccessLocalFileTpl = __dirname + "/src/.htaccess";
    let htaccessLocalFile = "./web/sites/.htaccess";
    fsx.copySync(htaccessLocalFileTpl, htaccessLocalFile);
    log(chalk.yellow(".htaccess file written"), 0);

  }

}

module.exports = NewSiteD8;
