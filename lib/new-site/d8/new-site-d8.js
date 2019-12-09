let log = require('../../utils/logger.js').getInstance().log;
const creds = require('../../utils/credentials.js');
const os = require('os');
const fsx = require('fs-extra');
const yaml = require('js-yaml');
const utils = require('../../utils/utils');

function NewSiteD8(args) {
  this.args = args;

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

    // Write/add local.services.yml.
    let servicesLocalFileTpl = __dirname + "/src/settings.local.php.tpl";
    let servicesLocalFile = "./web/sites/local.services.php";
    fsx.copySync(servicesLocalFileTpl, servicesLocalFile);

    // Add and update quiksilver files.
    let fileTpl = __dirname + "/src/drush_config_import.php";
    let file = "./web/private/drush_config_import.php";
    fsx.copySync(fileTpl, file);

    fileTpl = __dirname + "/src/new_relic_deploy.php";
    file = "./web/private/new_relic_deploy.php";
    fsx.copySync(fileTpl, file);

    var panthDoc = yaml.safeLoad(fsx.readFileSync('pantheon.yml', 'utf8'));
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

    // Add items to .gitignore.

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

    // Add behat local.
    composerFile.scripts = utils.addToObject(composerFile.scripts, "behat-local", "./.ci/scripts/run-behat-local", 5);

    // Add required default drupal modules and themes.

    // Add Bluecadet module directory stuff.
    composerFile.extra = utils.addToObject(composerFile.extra, "installer-types", ["custom-drupal-module"], 0);
    composerFile.extra['installer-paths'] = utils.addToObject(composerFile.extra['installer-paths'], "web/modules/bluecadet/{$name}", ["type:custom-drupal-module"], 2);

    // Set PHP to 7.2.
    composerFile.config.platform.php = '7.2';

    // Write Composer file.
    let composerData = JSON.stringify(composerFile, null, 4);
    fsx.outputFileSync('./composer.json', composerData);
  }

}

module.exports = NewSiteD8;
