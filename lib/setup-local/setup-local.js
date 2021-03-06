

let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');

function SetupLocal(args) {
  this.args = args;

  this.run = () => {
    // log('TODO: new-site')
    // log(args);

    // Gather all required credentials.
    creds.initGithubCreds()
      .then((response) => {
        // log(response);

        return creds.initPanthCreds();
      }).then((response) => {
        // log(response);

        return creds.initLocalDbCreds();
      }).then((response) => {
        // log(response);

        // Run WP/Drupal init.
        switch (response.format) {
          case 'Drupal 9: Circle CI':
            let D9LocalSetup = require('./d9/setup-local-d9.js');
            return new D9LocalSetup(this.args).newSetupProject();
            break;
          case 'Drupal 8: Circle CI':
          case 'Drupal 8: Default':
            let D8LocalSetup = require('./d8/setup-local-d8.js');
            return new D8LocalSetup(this.args).newSetupProject();
            break;
          case 'WordPress: Circle CI':
          case 'WordPress: Default':
            let WPLocalSetup = require('./wp/setup-local-wp.js');
            WPLocalSetup(response);
            break;
          default:
            return
        }

      }).catch((error) => {
        log(error, 2);
      });

  }
}

module.exports = SetupLocal;
