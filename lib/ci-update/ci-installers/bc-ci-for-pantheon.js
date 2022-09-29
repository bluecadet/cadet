const qoa = require('qoa');

let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');

let BcCiInstallerError = require('../../utils/errors/BcCiInstallerError.js');

const fsx = require('fs-extra');

const dlrepo = require('download-git-repo');
const GitHub = require('github-api');
const semver = require('semver');

const PROJ_CONFIG = require(process.cwd() + '/.projectconfig.js');

// Installer specific
const repo = "bc-ci-for-pantheon";

module.exports.install = (config) => {

  return new Promise((resolve, reject) => {
    log(chalk.blue(`Starting installation...`));

    // Figure out Version.
    log(chalk.blue(`...figure out version from ${config.reqVersion}...` ));

    resolve(getPossibleVersions(config, log));
  })
  .then((possibleVersions) => {

    log(possibleVersions, 3);
    let found = true;

    if (possibleVersions.tags) {
      let i = 0;
      while (found === true) {
        if (possibleVersions.tags[i] !== undefined) {
          log(possibleVersions.tags[i], 3);
          if (semver.satisfies(possibleVersions.tags[i], config.reqVersion)) {
            log(chalk.yellow("Found version: " + possibleVersions.tags[i]), 2);
            found = possibleVersions.tags[i];
          }
        }
        else {
          log(chalk.red("END LOOP"), 1);
          found = false;
        }
        i++;
      }
    } else if (possibleVersions.branch) {

      log(chalk.yellow("Found branch: " + possibleVersions.branch), 2);
      found = possibleVersions.branch;
    }

    log(found, 3);

    if (!found) {
      throw new BcCiInstallerError("No github tag or branch found for version supplied.", 'no_version_found');
    }

    config.installVersion = found;

    log(chalk.blue(`...installing CI version ${config.installVersion}...\n`));

    log(chalk.black.bgYellow(`This will overwrite existing ci configuration.`));

    let contStr = chalk.yellow.bold('Do you wish to continue?');
    let continuePrompt = [
      {
        type: 'confirm',
        query: contStr,
        handle: 'continue',
        accept: 'y',
        deny: 'n'
      }
    ];

    return qoa.prompt(continuePrompt);
  })
  .then((response) => {
    // log("\n");

    if (!response.continue) {
      throw new BcCiInstallerError("User Terminated", 'user_terminated');
    }

    log(chalk.yellow("Continueing..."), 1);

    // Remove contents and create directory.
    log(chalk.yellow("Preparing repo directory..."), 1);
    fsx.emptydirSync(config.tmpRepoDir);

    // Download repo.
    log(chalk.yellow("Repo: bluecadet/" + repo + '#' + config.installVersion), 1);

    return new Promise((resolve, reject) => {
      let dl = 'bluecadet/' + repo + '#' + config.installVersion;
      log(dl, 1);

      dlrepo(dl, `${config.tmpRepoDir}`, { clone: true }, err => {
        if (err) {
          log(chalk.red(`ERROR @ downloading repo`));
          reject();
          throw new BcCiInstallerError("Github error: " + err, 'github_error');
        }
        resolve();
      });

    })
      // .then(() => { return [] });
  })
  .then(() => {

    if (fsx.existsSync(config.tmpRepoDir + '/manifest.json')) {
      log(chalk.green("Manifest exists..."), 3);

      /**
       * Github Actions
       */
      const manifest = fsx.readJsonSync(config.tmpRepoDir + '/manifest.json');

      manifest.forEach((dir) => {
        let mEntry = config.tmpRepoDir + '/build/' + dir;

        fsx.readdirSync(mEntry).forEach(child => {
          // Setup source and destinations.
          let source = mEntry + "/" + child;
          let dest = "./" + dir + "/" + child;

          fsx.copySync(source, dest, {
            'overwrite': true
          });
        });
      });

      // END - Github Actions
    }
    else {
      log(chalk.green("Manifest does not exist."), 3);

      // Copy .ci folders
      log(chalk.blue("\nPreparing to sync .ci folders..."), 0);

      /**
       * CircleCI
       */
      if (fsx.existsSync('./.ci')) {
        fsx.emptydirSync('./.ci');
        fsx.removeSync('./.ci');
        log(chalk.blue("...cleaned out .ci directory..."));
      }
      if (fsx.existsSync('./.circleci')) {
        fsx.emptydirSync('./.circleci');
        fsx.removeSync('./.circleci');
        log(chalk.blue("...cleaned out .circleci directory..."));
      }
      fsx.copySync(config.tmpRepoDir + '/build/.ci', './.ci');
      fsx.copySync(config.tmpRepoDir + '/build/.circleci', './.circleci');

      // Copy tests config if needed.
      if (config.incTestConfig) {
        log(chalk.yellow("Preparing Test config files..."), 1);
        fsx.copySync(config.tmpRepoDir + '/build/tests', './tests');
        log(chalk.blue("...finished copying test default config files..."));
      }
      else {
        log(chalk.blue("...Not copying any test config files. But will copy Config Generator folder..."));
        fsx.copySync(config.tmpRepoDir + '/build/tests/config-gen', './tests/config-gen');
        log(chalk.blue("...finished copying test config generator files..."));
        log(chalk.yellow.bold("\n-- Re-run command with the `--incTestConfig` option if you wanted to include default test files.\n"));
      }

      // Add Env Vars to CircleCi config.
      if (PROJ_CONFIG.terminus_site || PROJ_CONFIG.liveDomain) {
        log(chalk.blue("...adding env vars to your CircleCi config..."));

        let filePath = process.cwd() + '/.circleci/config.yml';
        var file = fsx.readFileSync(filePath);
        var data = file.toString().split("\n");

        let startLine = 36;

        if (PROJ_CONFIG.terminus_site) {
          data.splice(startLine, 0, "    TERMINUS_SITE: " + PROJ_CONFIG.terminus_site);
          startLine++;
          data.splice(startLine, 0, "    TEST_SITE_NAME: " + PROJ_CONFIG.terminus_site);
          startLine++;
        }

        if (PROJ_CONFIG.liveDomain) {
          data.splice(startLine, 0, "    LIVE_DOMAIN: " + PROJ_CONFIG.liveDomain);
          startLine++;
        }

        var text = data.join("\n");

        fsx.writeFile(filePath, text, function (err) {
          if (err) return log(chalk.red(err));
        });
      }

      // END CircleCI
    }

    // Clean up directories.
    log(chalk.blue("cleaning up..."), 0);
    if (fsx.existsSync(config.tmpRepoDir)) {
      fsx.emptydirSync(config.tmpRepoDir);
      fsx.removeSync(config.tmpRepoDir);
      log(chalk.green("Tmp Repo Directory cleaned up."));
    }
    log(chalk.blue("... Finished cleaning up."), 0);

    return {status: "success"}
  })
  .catch((error) => {
    log("Error in Main bc-ci-for-pantheon", 1);
    log(error, 1);

    if (error.request && error.response.status == 401) {
      throw new BcCiInstallerError("Github error: " + error.response.data.message, 'github_error');
    }

    throw error;
  });
}

function getPossibleVersions (config, log) {

  // Basic Auth
  let gh;
  if (config.creds.githubMachineToken) {
    gh = new GitHub({
      token: config.creds.githubMachineToken
    });
  } else {
    gh = new GitHub({
      username: config.creds.githubUsername,
      password: config.creds.githubPassword
    });
  }

  let repoObj = gh.getRepo('bluecadet', repo);

  let githubTags = [];
  let tagPromise = repoObj.listTags().then(function ({ data }) {
    githubTags = data.map(x => semver.clean(x.name));
  });

  let githubBranches = [];
  let branchPromise = repoObj.listBranches().then(function ({ data }) {
    data.forEach(el => {
      if (el.name !== "master") {
        githubBranches.push(el.name);
      }
    });
  });


  return Promise.all([tagPromise, branchPromise]).then(function () {

    let branchPattern = /(.*)-latest$/;
    let matches = config.reqVersion.match(branchPattern);
    log(matches, 1);

    if (matches && matches[1] && githubBranches.includes(matches[1])) {

      return { branch: matches[1] };
    }
    else {
      let allVersions = githubTags;

      allVersions.sort((a, b) => {
        return semver.rcompare(a, b);
      });

      return { tags: allVersions };
    }
  });
}
