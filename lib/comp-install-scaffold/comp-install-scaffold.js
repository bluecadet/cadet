const fsx = require('fs-extra');
const log = require('../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const spawnSync = require('child_process').spawnSync;
const compPackages = require('../utils/packages/packages.js').PACKAGES;

function Composer(args) {
  this.args = args;

  this.run = () => {
    log(this.args, 3);

    // Which platform?
    switch (args.cms) {

      // ======
      // DRUPAL
      // ======
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

      // =========
      // WordPress
      // =========
      case "WP":

        try {

          // Run composer install
          log(chalk.blue("...running `composer install`..."), 0);

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
              args.packages.forEach((bundle) => {
                if (compPackages[args.cms] && compPackages[args.cms][bundle]) {
                  log(chalk.blue(`\n...adding additional packages...`), 0);
                  composerPack = spawnSync('composer', ['require', '--no-update'].concat(compPackages[args.cms][bundle].composer), {
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
            log(chalk.bgRed("\n  Composer Packages errored  \n"), 0);
            log(error, 1);
          }

          try {
            log(chalk.blue("\n...`composer install` one more time..."), 0);

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
            log(chalk.bgRed("\n  Composer Install errored  \n"), 0);
            log(error, 1);
          }

        }
        catch (error) {
          log(chalk.bgRed("\n  Initial `composer install` errored. Please try again.  \n"), 0);
          log(error, 1);
        }

        // Try to install with WP CLI
        try {
          log(chalk.green("\n...trying to activate plugins with WP CLI..."), 0);

          let initWPCLI = spawnSync('wp', ['--info'], {
            // stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
          });

          log(initWPCLI, 3);

          // No WP CLI
          if (initWPCLI.status !== 0) {
            chalk.bgRed("\n  WP CLI not found. Please install and re-run `cadet site-init` or enable plugins manually.  \n");
          } else {

            // Try to activate plugins via WP CLI
            if (args.packages) {
              args.packages.forEach((bundle) => {
                // console.log(bundle);
                if (compPackages[args.cms] && compPackages[args.cms][bundle]) {
                  compPackages[args.cms][bundle].wp_cli.forEach(plugin => {
                    spawnSync('wp', ['plugin', 'activate', plugin], {
                      stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
                    });
                  });
                }
              });
            }
          }

        } catch {
          chalk.bgRed("Issue connecting to WP CLI.");
          log(error, 1);
        }

        break;
    }
  }
}

module.exports = Composer;
