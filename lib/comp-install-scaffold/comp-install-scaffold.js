const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
let log = require('../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../utils/credentials.js');
const spawnSync = require('child_process').spawnSync;
const compPackages = require('../utils/packages/packages.js').PACKAGES;

function Composer(args) {
  this.args = args;

  this.run = () => {
    log(this.args, 3);

    // Which platform?
    switch (args.cms) {
      case "D8":
        log(chalk.yellow("Trying to update and add composer requirements."), 0);

        // Run update first.
        try {
          let initUpdate = spawnSync('composer', ['install'], {
            stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
          });
          log(initUpdate, 3);

          if (initUpdate.status !== 0) {
            throw new Error(initUpdate.stderr.toString());
          }

          // Add groups of modules/themes.
          try {
            if (args.packages) {
              args.packages.forEach(el => {

                if (compPackages[args.cms] && compPackages[args.cms][el]) {
                  log(chalk.yellow("Adding packages: " + compPackages[args.cms][el].composer.join(" ")), 1);
                  composerPack = spawnSync('composer', ['require', '--no-update'].concat(compPackages[args.cms][el].composer), {
                    stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
                  });

                  if (composerPack.status !== 0) {
                    throw new Error(composerPack.stderr.toString());
                  }
                }
              });
            }
          }
          catch (error) {
            log(chalk.red("Composer Packages errored\n"), 0);
            log(error, 1);
          }

          try {
            log(chalk.yellow("Trying to run composer install."), 0);

            // Force deletion b/c we are really starting fresh.
            fsx.removeSync('./composer.lock');

            let initInstall = spawnSync('composer', ['install'], {
              stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
            });
            log(initInstall, 3);

            if (initInstall.status !== 0) {
              throw new Error(initInstall.stderr.toString());
            }
          }
          catch (error) {
            log(chalk.red("Composer Install errored\n"), 0);
            log(error, 1);
          }
        }
        catch (error) {
          log(chalk.red("Initial `composer install` errored\n"), 0);
          log(error, 1);
        }

        break;
      case "WP":

        break;
    }
  }
}

module.exports = Composer;
