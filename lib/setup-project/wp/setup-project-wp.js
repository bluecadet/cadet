let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../../utils/credentials.js');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const setupLocalWP = require('../../setup-local/wp/setup-local-wp');
const globalVars = require('../../utils/globals');

module.exports = function(args) {

  log(chalk.green("Starting Init WP Site operations"), 0);

  const rootPath = process.cwd();

  // Add items to .gitignore.
  fsx.pathExists(path.join(rootPath, '.gitignore'))
    .then((exists) => {
      if ( exists ) {
        const gitignoreFile = path.join(process.cwd(), '.gitignore');
        fsx.readFile(gitignoreFile, 'utf8')
          .then(() => {
            let gitIgnoreToAdd = fsx.readFileSync(__dirname + '/src/_gitignore', 'utf8').toString();
            fsx.appendFileSync(gitignoreFile, "\n" + gitIgnoreToAdd);
          })
          .catch(err => {
            console.log(err);
          })
      }
    });




  // Run Composer workflow if there is a composer.json file
  fsx.pathExists(path.join(rootPath, 'composer.json'))
    .then((exists) => {
      if (exists) {
        let composerFile = JSON.parse(fsx.readFileSync('./composer.json'));

        // Set PHP Version
        composerFile.config.platform.php = globalVars.phpVersion;

        // Set min-stability.
        composerFile['minimum-stability'] = 'alpha';

        // Write Composer file.
        let composerData = JSON.stringify(composerFile, null, 4);
        fsx.outputFileSync('./composer.json', composerData);

        log(chalk.blue("...composer.json file updated..."), 0);

        // Add required default drupal modules and themes.
        let Composer = require('../../comp-install-scaffold/comp-install-scaffold.js');
        let composer = new Composer({ cms: "WP", packages: ['web'] });
        composer.run();
        log(chalk.green("💫 Finished Composer commands \n"), 0);
      }
    });


  // Add WP Config File
  let newWPConfigFilePath;

  fsx.pathExists(path.join(rootPath, 'web/index.php'))
    .then((exists) => {
      if (exists) {
        wpConfigDir = path.join(rootPath, 'web');
        newWPConfigFilePath = 'src/wp-config-composer/wp-config.php'
      } else {
        wpConfigDir = rootPath;
        newWPConfigFilePath = 'src/wp-config-basic/wp-config.php'
      }

      const wpConfigFile = path.join(wpConfigDir, 'wp-config.php');
      // const wpConfigSourcePath = args.format ===
      fsx.copy(path.resolve(__dirname, newWPConfigFilePath), wpConfigFile);
      log(chalk.blue("...wp-config.php file replaced...\n"), 0);
    });

  setupLocalWP();

}