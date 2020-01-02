let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');

const creds = require('../../utils/credentials.js');
const os = require('os');
const fsx = require('fs-extra');
const yaml = require('js-yaml');
const utils = require('../../utils/utils');
const compPackages = require('../../utils/packages/packages.js').PACKAGES;
const spawnSync = require('child_process').spawnSync;

function InitSiteD8(args) {
  this.args = args;
  this.args.cms = 'D8';

  this.initSiteSetup = () => {
    log(chalk.yellow("Starting Init Site operations"), 0);

    var dbSettings = creds.getLocalDbCreds();

    // Add and update quiksilver files.
    let fileTpl = __dirname + "/src/drush_config_import.php";
    let file = "./web/private/drush_config_import.php";
    fsx.copySync(fileTpl, file);

    fileTpl = __dirname + "/src/new_relic_deploy.php";
    file = "./web/private/new_relic_deploy.php";
    fsx.copySync(fileTpl, file);

    var panthDoc = yaml.safeLoad(fsx.readFileSync('pantheon.yml', 'utf8'));
    panthDoc.php_version = 7.2;
    panthDoc.workflows.sync_code.after.push({
      type: 'webphp',
      description: 'Import configuration from.yml files',
      script: 'private/drush_config_import.php'
    });
    panthDoc.workflows.sync_code.after.push({
      type: 'webphp',
      description: 'Log to New Relic',
      script: 'private/new_relic_deploy.php'
    });

    panthDoc.workflows.deploy = {
      after: [
        {
          type: 'webphp',
          description: 'Import configuration from .yml files',
          script: 'private/drush_config_import.php'
        },
        {
          type: 'webphp',
          description: 'Log to New Relic',
          script: 'private/new_relic_deploy.php'
        }
      ]
    };
    fsx.outputFileSync('./pantheon.yml', yaml.dump(panthDoc, { skipInvalid: true}));

    log(chalk.yellow("Quicksilver files updated"), 0);

    // Add items to .gitignore.
    let gitIgnoreToAdd = fsx.readFileSync(__dirname + '/src/_gitignore', 'utf8').toString();
    fsx.appendFileSync('.gitignore', "\n" + gitIgnoreToAdd);

    // Composer.
    let composerFile = JSON.parse(fsx.readFileSync('./composer.json'));

    // Re-write code-sniff script for proper ignores.
    composerFile.scripts['code-sniff'] = [
      "./vendor/bin/phpcs -s --standard=Drupal --extensions=php,module,inc,install,test,profile,theme,css,info,txt --ignore=node_modules,bower_components,vendor,dist --exclude=Drupal.InfoFiles.AutoAddedKeys --colors ./web/modules/custom",
      "./vendor/bin/phpcs -s --standard=Drupal --extensions=php,module,inc,install,test,profile,theme,css,info,txt --ignore=node_modules,bower_components,vendor,fractal,dist,fonts --exclude=Drupal.InfoFiles.AutoAddedKeys --colors ./web/themes/custom",
      "./vendor/bin/phpcs -s --standard=DrupalPractice --extensions=php,module,inc,install,test,profile,theme,css,info,txt --ignore=node_modules,bower_components,vendor,dist --exclude=Drupal.InfoFiles.AutoAddedKeys --colors ./web/modules/custom",
      "./vendor/bin/phpcs -s --standard=DrupalPractice --extensions=php,module,inc,install,test,profile,theme,css,info,txt --ignore=node_modules,bower_components,vendor,fractal,dist,fonts --exclude=Drupal.InfoFiles.AutoAddedKeys --colors ./web/themes/custom"
    ];

    // Add phpunit-test script.
    composerFile.scripts = utils.addToObject(composerFile.scripts, "phpunit-test", "./.ci/scripts/tests/on-server-phpunit-tests.sh", 4);

    // phpunit/phpunit
    composerFile['require-dev']['phpunit/phpunit'] = "^6";

    // Add behat local.
    composerFile.scripts = utils.addToObject(composerFile.scripts, "behat-local", "./.ci/scripts/run-behat-local", 5);

    // Add Bluecadet module directory stuff.
    composerFile.extra = utils.addToObject(composerFile.extra, "installer-types", ["custom-drupal-module"], 0);
    composerFile.extra['installer-paths'] = utils.addToObject(composerFile.extra['installer-paths'], "web/modules/bluecadet/{$name}", ["type:custom-drupal-module"], 2);

    // Set PHP to 7.2.
    // @TODO: Variableize this.
    composerFile.config.platform.php = '7.2';

    // Set min-stability.
    composerFile['minimum-stability'] = 'alpha';

    // Write Composer file.
    let composerData = JSON.stringify(composerFile, null, 4);
    fsx.outputFileSync('./composer.json', composerData);

    log(chalk.yellow("Composer.json File Updated"), 0);

    // Add required default drupal modules and themes.
    log(chalk.yellow("Try to run Composer commands\n"), 0);

    let Composer = require('../../comp-install-scaffold/comp-install-scaffold.js');
    let composer = new Composer({ cms: "D8", packages: ['adminTheme', 'devModules', 'baseBluecadet', 'baseWeb'] });
    composer.run();

    log(chalk.yellow("Finished Composer commands"), 0);

    // Drush - Actually enable modules...
    log(chalk.yellow("Trying to update and add composer requirements."), 0);
    log(this.args.packages);
    log(args.cms);
    if (this.args.packages) {
      this.args.packages.forEach(el => {

        if (compPackages[args.cms] && compPackages[args.cms][el]) {
          log(chalk.yellow("Enabling packages: " + compPackages[args.cms][el].composer.join(" ")), 1);
          composerPack = spawnSync('drush', ['en'].concat(compPackages[args.cms][el].drush), {
            stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
          });

          if (composerPack.status !== 0) {
            throw new Error(composerPack.stderr.toString());
          }
        }
      });
    }


    log(chalk.red("You should run `drush cex` to export new configuration"), 0);
  }

}

module.exports = InitSiteD8;
