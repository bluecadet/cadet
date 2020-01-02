const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const qoa = require('qoa');
// const utils = require('./utils.js');
const chalk = require('chalk');
const localConfig = path.join(process.cwd(), '.local-projectconfig.js');
const CMS_OPTIONS = [
  'Drupal 8: Circle CI',
  'Drupal 8: Default',
  'WordPress: Circle CI',
  'WordPress: Default',
  'Custom File Path'
];

const cmsFilePath = (cms) => {

  if (cms === 'Drupal 8: Circle CI') {
    return `/web/sites/default/files`;
  } else if (cms === 'Drupal 8: Default') {
    return `/sites/default/files`;
  } else if (cms === 'WordPress: Circle CI') {
    return `/web/wp-content/uploads`;
  } else if (cms === 'WordPress: Default') {
    return `/wp-content/uploads`;
  } else {
    return '/files';
  }

}


function processResponse(response, filepath) {

  let db_user = response.db_user ? response.db_user : 'root';
  let db_pass = response.db_pass ? response.db_pass : 'root';
  let db_host = response.db_host ? response.db_host : 'localhost';
  let bac_exp = response.bac_exp ? response.bac_exp : '60';

let data = `module.exports = {
  site: '${response.pantheon_site}',
  localDatabase: {
    name: '${response.db_name}',
    user: '${db_user}',
    pass: '${db_pass}',
    host: '${db_host}',
  },
  format: '${response.setup}',
  file_path: '${filepath}',
  backup_expires: '${bac_exp}',
}`;

  // Write file with config data
  fs.writeFileSync(localConfig, data, function(err) {
    if (err) {
      throw Error(err);
    }
  });

  console.log(chalk.green('⚡️ Project config complete!'));

}

module.exports = function() {

  fsx.ensureFile(localConfig)
    .then(() => {
      // Setup prompt data for config
      const setup = [
        {
          type: 'input',
          query: `${chalk.cyan('Pantheon site name:')}`,
          handle: 'pantheon_site'
        },
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
          query: `${chalk.cyan('Local database hostname')} [localhost]:`,
          handle: 'db_host'
        },
        {
          type: 'interactive',
          query: `${chalk.cyan('Select structure')}`,
          handle: 'setup',
          symbol: '>',
          menu: CMS_OPTIONS
        },
        {
          type: 'input',
          query: `${chalk.cyan('Number (in minutes) that an existing backup is valid for (if backup is older, a new one will be created)')} [60]:`,
          handle: 'bac_exp'
        },
      ];

      qoa.prompt(setup)
        .then((response) => {

          let filepath = false;

          if ( response.setup === 'Custom File Path' ) {
            qoa.prompt([{
              type: 'input',
              query: `${chalk.cyan('Relative path to files:')}`,
              handle: 'file_path'
            }])
            .then((fp_response) => {
              processResponse(response, fp_response.file_path);
            });
          } else {
            processResponse(response, cmsFilePath(response.setup));
          }

        });
    })
    .catch((err) => {
      console.log(err);
    });

  // // Create info directory if it does not exist
  // if ( !fs.existsSync('./.local-projectconfig.js') ) {
  //   console.log(chalk.red('Error: configuration required.'));
  //   console.log(chalk.red('Run ') + chalk.red.italic('bcdb config') + chalk.red(' to complete configuration.'));
  //   process.exit(1);
  // }



}

// function Init() {
//   console.log('init');
// }

// module.exports = Init;