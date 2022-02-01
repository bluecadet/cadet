// TODO: RENAME TO STORAGE.JS??

const os = require('os');
const fsx = require('fs-extra');
const path = require('path');
const qoa = require('qoa');
const chalk = require('chalk');
const utils = require('./utils');
let log = require('../utils/logger.js').getInstance().log;

let cred_config = {};
cred_config.baseUserDir = path.join(os.homedir(), '.cadet');
cred_config.baseProjDir = path.join('./', '.cadet');
cred_config.credsDirName = "creds";
cred_config.credsDirUser = path.join(cred_config.baseUserDir, cred_config.credsDirName);
cred_config.credsDirProj = path.join(cred_config.baseProjDir, cred_config.credsDirName);
cred_config.githubCredsFileName = "ghCreds.json";
cred_config.pantheonCredsFileName = "panthCreds.json";
cred_config.dbCredsFileName = "local-db.json";

module.exports.tmpDir = path.join(os.homedir(), '.cadet');

// GitHub
module.exports.initGithubCreds = () => {
  return new Promise((resolve, reject) => {

    let creds = {
      githubMachineToken: '',
      githubUsername: '',
      githubPassword: ''
    }

    // Load credentials...
    if (fsx.existsSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName))) {
      let rawdata = fsx.readFileSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName));
      creds = JSON.parse(rawdata);

      if (creds.githubMachineToken || creds.githubUsername) {
        return resolve(creds);
      }
    }

    // Prompt for github login or machine token...
    const gitMachineTokenPrompt = [
      {
        type: 'input',
        query: `${chalk.cyan('Github Personal Access Token (or `n` to skip to username and password):')}`,
        handle: 'githubMachineToken'
      }
    ];

    return qoa.prompt(gitMachineTokenPrompt).then((response) => {
      if (response.githubMachineToken == 'n') {
        const getUserPassPrompt = [
          {
            type: 'input',
            query: `${chalk.cyan('Github username:')}`,
            handle: 'githubUsername'
          },
          {
            type: 'input',
            query: `${chalk.cyan('Github password:')}`,
            handle: 'githubPassword'
          }
        ];
        return qoa.prompt(getUserPassPrompt);
      }

      creds.githubMachineToken = response.githubMachineToken;

      return response;
    })
    .then((response) => {

      if (response.githubUsername) creds.githubUsername = response.githubUsername;
      if (response.githubPassword) creds.githubPassword = response.githubPassword;

      let data = JSON.stringify(creds, null, 2);

      // If directory doesn't exist, create it.
      if (!fsx.existsSync(cred_config.credsDirUser)) {
        fsx.ensureDirSync(cred_config.credsDirUser, { recursive: true });
      }

      fsx.writeFileSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName), data);

      return resolve(creds);
    })
    .catch((error) => {
      log(chalk.red("Error in credentials.js"), 1);
      log(error, 2);
    });
  });
}

module.exports.getGithubCreds = () => {

  if (fsx.existsSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName))) {
    let rawdata = fsx.readFileSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName));
    creds = JSON.parse(rawdata);
    return creds;
  }
  return {};
}

module.exports.clearGithubCreds = () => {
  if (fsx.existsSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName))) {
    fsx.unlinkSync(path.join(cred_config.credsDirUser, cred_config.githubCredsFileName));
    log(chalk.green("Github Credentials removed"));
  }
}

// Pantheon
module.exports.initPanthCreds = () => {
  return new Promise((resolve, reject) => {
    let creds = {
      pantheonSite: '',
    }

    // Load credentials...
    if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName))) {
      let rawdata = fsx.readFileSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName));
      creds = JSON.parse(rawdata);

      if (creds.pantheonSite) {
        return resolve(creds);
      }
    }

    // Prompt for github login or machine token...
    const panthPrompt = [
      {
        type: 'input',
        query: `${chalk.cyan('Pantheon site name:')}`,
        handle: 'pantheonSite'
      }
    ];

    return qoa.prompt(panthPrompt).then((response) => {
      creds.pantheonSite = response.pantheonSite;

      let data = JSON.stringify(creds, null, 2);

      // If directory doesn't exist, create it.
      if (!fsx.existsSync(cred_config.credsDirProj)) {
        fsx.ensureDirSync(cred_config.credsDirProj, { recursive: true });
      }

      fsx.writeFileSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName), data);

      return resolve(creds);
    })
    .catch((error) => {
      log(chalk.red("Error in credentials.js"), 1);
      log(error, 2);
    });
  });
}

module.exports.getPanthCreds = () => {
  if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName))) {
    let rawdata = fsx.readFileSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName));
    creds = JSON.parse(rawdata);

    return creds;
  }

  return {};
}

module.exports.clearPanthCreds = () => {
  if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName))) {
    fsx.unlinkSync(path.join(cred_config.credsDirProj, cred_config.pantheonCredsFileName));
    log(chalk.green("Pantheon Credentials removed"));
  }
}

// LocalDB
module.exports.initLocalDbCreds = () => {

  return new Promise((resolve, reject) => {
    let creds = {}

    // Load credentials...
    if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName))) {
      let rawdata = fsx.readFileSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName));
      creds = JSON.parse(rawdata);

      if (creds.db_name) {
        return resolve(creds);
      }
    }

    // Setup prompt data for config
    const setup = [
      {
        type: 'input',
        query: `${chalk.cyan('Local database name:')}`,
        handle: 'db_name'
      },
      {
        type: 'input',
        query: `${chalk.cyan('Local database user ')} [root]:`,
        handle: 'db_user'
      },
      {
        type: 'input',
        query: `${chalk.cyan('Local database password')} [root]:`,
        handle: 'db_pass'
      },
      {
        type: 'input',
        query: `${chalk.cyan('Local database table prefix')} []:`,
        handle: 'db_prefix'
      },
      {
        type: 'input',
        query: `${chalk.cyan('Local database hostname')} [localhost]:`,
        handle: 'db_host'
      },
      {
        type: 'input',
        query: `${chalk.cyan('Local database port')} [3306]:`,
        handle: 'db_port'
      },
      {
        type: 'interactive',
        query: `${chalk.cyan('Select structure')}`,
        handle: 'format',
        symbol: '>',
        menu: utils.CMS_OPTIONS
      },
      {
        type: 'input',
        query: `${chalk.cyan('Number (in minutes) that an existing backup is valid for (if backup is older, a new one will be created)')} [60]:`,
        handle: 'bac_exp'
      },
    ];

    return qoa.prompt(setup).then((response) => {

      creds.db_name = response.db_name ? response.db_name : '';
      creds.db_user = response.db_user ? response.db_user : 'root';
      creds.db_pass = response.db_pass ? response.db_pass : 'root';
      creds.db_prefix = response.db_prefix ? response.db_prefix : '';
      creds.db_host = response.db_host ? response.db_host : 'localhost';
      creds.db_port = response.db_port ? response.db_port : '3306';
      creds.format = response.format ? response.format : '';
      creds.bac_exp = response.bac_exp ? response.bac_exp : 60;
      creds.file_path = utils.getFilesPath(response.format);

      let data = JSON.stringify(creds, null, 2);

      // If directory doesn't exist, create it.
      if (!fsx.existsSync(cred_config.credsDirProj)) {
        fsx.ensureDirSync(cred_config.credsDirProj, { recursive: true });
      }

      fsx.writeFileSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName), data);

      return resolve(creds);
    })
    .catch((error) => {
      log(chalk.red("Error in credentials.js"), 1);
      log(error, 2);
    });
  });
}

module.exports.getLocalDbCreds = () => {
  if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName))) {
    let rawdata = fsx.readFileSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName));
    creds = JSON.parse(rawdata);

    return creds;
  }

  return {};
}

module.exports.clearLocalDbCreds = () => {
  if (fsx.existsSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName))) {
    fsx.unlinkSync(path.join(cred_config.credsDirProj, cred_config.dbCredsFileName));
    log(chalk.green("LocalDB Credentials removed"));
  }
}

// Temp Site Date
module.exports.getTempStorageDir = () => {
  return path.join(cred_config.baseUserDir, 'tmp');
}