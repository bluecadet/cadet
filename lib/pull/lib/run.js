const pantheon = require('./pantheon.js');
const creds = require('../../utils/credentials.js');
const qoa = require('qoa');
const chalk = require('chalk');
const argv = require('yargs').argv;


module.exports = () => {

  /**
   * Setup Pantheon Site Name
   */
  const pantheonCreds = creds.getPanthCreds();

  // If pantheon site name not set, bail
  if ( !pantheonCreds.pantheonSite ) {
    console.log(chalk.red('Error: configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('cadet OOPSIES ASK SHAUN') + chalk.red(' to complete configuration.'));
    process.exit(1);
  }


  /**
   * Setup DB Credentials
   */
  const dbCreds = creds.getLocalDbCreds();

  // If there aren't db credentials setup, bail
  if ( !dbCreds.db_name ) {
    console.log(chalk.red('Error: configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('cadet pull init') + chalk.red(' to setup database configuration.'));
    process.exit(1);
  }


  /**
   * Allow `--force` or `-f` flags to force a new DB download.
   */
  if ( argv.force || argv.f ) {
    dbCreds.bac_exp = 'override';
  }


  /**
   * Get Env options from Pantheon
   */
  pantheon.getPantheonEnvsArray(pantheonCreds.pantheonSite)
    .then((pantheonEnvs) => {

      /**
       * QOA Interactive
       */
      const call = [
        {
          type: 'interactive',
          query: `${chalk.cyan('Select environment to pull from')}`,
          handle: 'env',
          symbol: '>',
          menu: pantheonEnvs
        },
        {
          type: 'confirm',
          query: `${chalk.cyan('Pull Database?')}`,
          handle: 'pull_db',
          accept: 'y',
          deny: 'n'
        },
        {
          type: 'confirm',
          query: `${chalk.cyan('Pull Files?')}`,
          handle: 'pull_files',
          accept: 'y',
          deny: 'n'
        }
      ];

      qoa.prompt(call)
        .then((response) => {

          const site = `${pantheonCreds.pantheonSite}.${response.env}`;

          // Pull Database
          if ( response.pull_db ) {
            pantheon.getPantheonDB(site, dbCreds)
              .then(() => {
                // Pull Files
                if ( response.pull_files ) {
                  pantheon.getPantheonFiles(site, dbCreds);
                }
              });
          } else {
            // Pull Files
            if ( response.pull_files ) {
              pantheon.getPantheonFiles(site, dbCreds);
            }
          }
        })
        .catch((err) => {
          console.log('CADET ERROR', err);
        });

    })
    .catch((err) => {
      console.log(err)
    });

}