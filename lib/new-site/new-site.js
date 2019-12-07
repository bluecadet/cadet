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

      }).catch((error) => {
        log(error, 2);

      });

    // Figure out WP || Drupal.

    // Run WP/Drupal init.


  }
}

module.exports = NewSite;
