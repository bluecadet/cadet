const pantheon = require('./pantheon.js');
const creds = require('../../utils/credentials.js');
const qoa = require('qoa');
const chalk = require('chalk');
const argv = require('yargs').argv;
const Spinner = require('cli-spinner').Spinner;

let spinner = new Spinner({
  text: chalk.blue(`%s Fetching Pantheon Envs`)
});
spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');


module.exports = () => {

  /**
   * Setup Pantheon Site Name
   */
  const pantheonCreds = creds.getPanthCreds();

  // If pantheon site name not set, bail
  if ( !pantheonCreds.pantheonSite ) {
    console.log(chalk.red('Error: Pantheon configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('cadet pull --init') + chalk.red(' to complete configuration.'));
    process.exit(1);
  }


  /**
   * Setup DB Credentials
   */
  const dbCreds = creds.getLocalDbCreds();

  // If there aren't db credentials setup, bail
  if ( !dbCreds.db_name ) {
    console.log(chalk.red('Error: database configuration required.'));
    console.log(chalk.red('Run ') + chalk.red.italic('cadet pull --init') + chalk.red(' to setup database configuration.'));
    process.exit(1);
  }

  /**
   * Get Env options from Pantheon
   */
  spinner.start();
  pantheon.getPantheonEnvsArray(pantheonCreds.pantheonSite)
    .then((pantheonEnvs) => {
      spinner.stop();
      process.stdout.clearLine();
      process.stdout.cursorTo(0);

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
        }
      ];

      qoa.prompt(call)
        .then((response) => {

          const site = `${pantheonCreds.pantheonSite}.${response.env}`;

          pantheon.getPantheonSpecificFiles(site, dbCreds, {
            'file': argv.file,
            'dir': argv.dir
          });
        })
        .catch((err) => {
          console.log('CADET ERROR', err);
        });

    })
    .catch((err) => {
      console.log(err)
    });

}
