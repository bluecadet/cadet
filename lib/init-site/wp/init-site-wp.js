let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../../utils/credentials.js');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const newWPSite = require('../../new-site/wp/new-site-wp.js');

module.exports = function(args) {

  newWPSite();

  log(chalk.green("Starting Init WP Site operations"), 0);

  var dbSettings = creds.getLocalDbCreds();

  // Add items to .gitignore.
  var gitignoreFile = path.join(process.cwd(), '.gitignore');

  fsx.readFile(gitignoreFile, 'utf8')
    .then(() => {
      let gitIgnoreToAdd = fsx.readFileSync(__dirname + '/src/_gitignore', 'utf8').toString();
      fsx.appendFileSync(gitignoreFile, "\n" + gitIgnoreToAdd);
    })
    .catch(err => {
      console.log(err);
    })

  // Composer.
  try {
    let composerFile = JSON.parse(fsx.readFileSync('./composer.json'));

    // Set PHP to 7.2.
    // @TODO: Variableize this.
    composerFile.config.platform.php = '7.2';

    // Set min-stability.
    composerFile['minimum-stability'] = 'alpha';

    // Write Composer file.
    let composerData = JSON.stringify(composerFile, null, 4);
    fsx.outputFileSync('./composer.json', composerData);

    log(chalk.blue("...composer.json file updated..."), 0);


    // Add required default drupal modules and themes.
    log(chalk.blue("...running Composer commands...\n"), 0);

    let Composer = require('../../comp-install-scaffold/comp-install-scaffold.js');
    let composer = new Composer({ cms: "WP", packages: ['web'] });
    composer.run();

    log(chalk.green("💫 Finished Composer commands \n"), 0);


  } catch (err) {
    log(chalk.bgRed("The composer.json file is not properly formatted or missing."), 0)
  }

}