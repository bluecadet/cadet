let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');

const creds = require('../../utils/credentials.js');
const os = require('os');
const fsx = require('fs-extra');
const yaml = require('js-yaml');
const utils = require('../../utils/utils');
const compPackages = require('../../utils/packages/packages.js').PACKAGES;
const uninstallPackages = require('../../utils/packages/packages.js').INIT_UNINSTALL;
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
    // @TODO: variabalize php version.
    panthDoc.php_version = 7.3;
    // @TODO: Check for existence, incase init is run more than once.
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

    // Set PHP to 7.3.
    // @TODO: Variableize this.
    composerFile.config.platform.php = '7.3';

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
          composerPack = spawnSync('drush', ['en', '-y'].concat(compPackages[args.cms][el].drush), {
            stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
          });

          if (composerPack.status !== 0) {
            throw new Error(composerPack.stderr.toString());
          }
        }
      });
    }

    // Drush - Remove unwanted modules...
    commentModCheck = spawnSync('drush', ['pm-list', '--pipe', '--type=module', '--status=enabled'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    list = commentModCheck.stdout.toString();
    list = list.split("\n");

    if (list.includes("comment")) {
      // @TODO: why does this work but not print anything...
      log(chalk.yellow("Removing Comment config"), 3);
      removeCommentConfig = spawnSync('drush', ['config-delete', 'field.field.node.article.comment'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      console.log(removeCommentConfig);
      if (removeCommentConfig.stdout) log("stdout: " + removeCommentConfig.stdout.toString(), 3);
      if (removeCommentConfig.stderr) log("stderr: " + removeCommentConfig.stderr.toString(), 3);

      removeCommentConfig2 = spawnSync('drush', ['config-delete', 'field.storage.node.comment'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      console.log(removeCommentConfig2);
      if (removeCommentConfig2.stdout) log("stdout: " + removeCommentConfig2.stdout.toString(), 3);
      if (removeCommentConfig2.stderr) log("stderr: " + removeCommentConfig2.stderr.toString(), 3);
    }

    if (uninstallPackages[args.cms]) {
      log(chalk.yellow("Uninstalling modules: " + uninstallPackages[args.cms].drush.join(" ")), 1);
      composerPackUninstall = spawnSync('drush', ['pmu', '-y'].concat(uninstallPackages[args.cms].drush), {
        stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
      });

      if (composerPackUninstall.status !== 0) {
        throw new Error(composerPackUninstall.stderr.toString());
      }
    }

    // Finish up.
    log("\n\n", 0);
    log(chalk.bgRed.white("*** You should run `drush cex` to export new configuration ***"), 0);
  }

}

module.exports = InitSiteD8;
