

let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');

function NewSite(args) {
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
          case 'Drupal 8: Circle CI':
          case 'Drupal 8: Default':
            let D8LocalSetup = require('./d8/setup-local-d8.js');
            return new D8LocalSetup(this.args).SetupLocalD8();
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

module.exports = NewSite;
