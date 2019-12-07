const os = require('os');
const fsx = require('fs-extra');
const path = require('path');
const qoa = require('qoa');
const chalk = require('chalk');

let cred_config = {};
cred_config.baseUserTempDir = path.join(os.homedir(), '.cadet-tmp');
cred_config.baseProjTempDir = path.join('./', '.cadet');
cred_config.credsDirName = "creds";
cred_config.credsDirUser = path.join(cred_config.baseUserTempDir, cred_config.credsDirName);
cred_config.credsDirProj = path.join(cred_config.baseProjTempDir, cred_config.credsDirName);
cred_config.githubCredsFileName = "ghCreds.json";
cred_config.pantheonCredsFileName = "panthCreds.json";

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
      return resolve(creds);
    }

    // Prompt for github login or machine token...
    const gitMachineTokenPrompt = [
      {
        type: 'input',
        query: 'Github machine token (or `n` to skip to username and password)',
        handle: 'githubMachineToken'
      }
    ];

    return qoa.prompt(gitMachineTokenPrompt).then((response) => {
      if (response.githubMachineToken == 'n') {
        const getUserPassPrompt = [
          {
            type: 'input',
            query: 'Github username',
            handle: 'githubUsername'
          },
          {
            type: 'input',
            query: 'Github password',
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

    })
    .catch((error) => {
      log(chalk.red("Error in credentials.js"), 1);
      log(error, 2);
    });
  });
}

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
    })
    .catch((error) => {
      log(chalk.red("Error in credentials.js"), 1);
      log(error, 2);
    });
  });
}

module.exports.initLocalDbCreds = () => {

}


module.exports.invalidateCreds = (config) => {

  if (fs.existsSync(config.credsFile)) {
    fs.unlinkSync(config.credsFile);
    log(chalk.green("Credentials removed"));
  }

  log(chalk.yellow("No credentials file to delete."));
}
