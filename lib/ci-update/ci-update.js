const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
const chalk = require('chalk');
const creds = require('../utils/credentials.js');
let Logger = require('../utils/logger.js');

function CiUpdate(args) {
  this.args = args;

  this.run = () => {
    let logger = new Logger(this.args.verbose);
    let log = logger.log;

    log(this.args, 3);

    // Configuration.
    let config = {
      curPath: process.cwd(),
      baseTempDir: path.join(os.homedir(), '.bc-ci-install'),
      creds: {
        githubMachineToken: '',
        githubUsername: '',
        githubPassword: ''
      },
      versionPattern: /([0-9]+)(\.([0-9x]+))?(\.([0-9x]+))?(-(([a-z]+)([.-]([0-9]+))?)?)?/,
      incTestConfig: this.args.incTestConfig,
      verbose: this.args.verbose,
      installer: this.args.i,
      reqVersion: this.args.c
    };
    config.credsDir = config.baseTempDir + "/creds";
    config.credsFile = config.credsDir + '/creds.json';
    config.tmpRepoDir = config.baseTempDir + "/repo";

    log(config, 3);

    // Verify project.
    // Verify we are in a project directory...
    if (!fsx.existsSync('./web/sites/default/settings.php')) {
      log(chalk.white.bgRed("\nNo `settings.php`, can't continue."));
      log(chalk.white.bgRed("***Are you sure you are in the proper folder?***"));
      return;
    }

    // Verify .projectconfig.js...
    if (!fsx.existsSync('./.projectconfig.js')) {
      log(chalk.white.bgRed("\nNo `.projectconfig.js`, can't continue."));
      log(chalk.white.bgRed("***Are you sure you are in the proper folder?***"));
      return;
    }

    // Check default config files...
    creds.initGithubCreds(config)
      .then((CredsResponse) => {
        // Set credentials from saved information or user prompt.
        config.creds = CredsResponse;

        // Do IT!!
        let installerModule = './ci-installers/' + config.installer + '.js';
        log(installerModule, 2);

        try {
          const installer = require(installerModule);
          return installer.install(config);
        }
        catch (err) {
          log(err);
          if (err.code === 'MODULE_NOT_FOUND') {
            log(chalk.red("Installer (" + config.installer + ") does not exist."));
            return { status: "installer_not_found" };
          }

          throw err;
        }
      })
      // Handle Status.
      .then((response) => {

        log(response, 2);

        if (response.status && response.status == "success") {
          log(chalk.green.bold("\n**********\nCONGRATS!! Files installed."));
        }

      })
      .catch((error) => {
        log(error, 2);

        if (error.status && error.status == "user_terminated") {
          log(chalk.red("User Terminated Installation."))
        }

        if (error.status && error.status == "installer_not_found") {
          log(chalk.red("Installer Not Found. Exiting Installation"))
        }

        if (error.status && error.status == "github_error") {
          log(chalk.red(error.msg))
        }

        if (error.status && error.status == "no_version_found") {
          log(chalk.red(error.msg))
        }
      });
  }
}

module.exports = CiUpdate;
