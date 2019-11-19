const fs = require('fs');
const qoa = require('qoa');
const chalk = require('chalk');

module.exports.initCreds = (config) => {
  return new Promise((resolve, reject) => {

    let creds = {
      githubMachineToken: '',
      githubUsername: '',
      githubPassword: ''
    }

    // Load credentials...
    if (fs.existsSync(config.credsFile)) {
      let rawdata = fs.readFileSync(config.credsFile);
      creds = JSON.parse(rawdata);
      return resolve(creds);
    }

    creds = {
      githubMachineToken: '',
      githubUsername: '',
      githubPassword: ''
    };

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
      if (!fs.existsSync(config.credsDir)) {
        fs.mkdirSync(config.credsDir, { recursive: true });
      }

      fs.writeFileSync(config.credsFile, data);

      resolve(creds);
    });

  })

}

module.exports.invalidateCreds = (config) => {

  if (fs.existsSync(config.credsFile)) {
    fs.unlinkSync(config.credsFile);
    console.log(chalk.green("Credentials removed"));
  }

  console.log(chalk.yellow("No credentials file to delete."));
}
