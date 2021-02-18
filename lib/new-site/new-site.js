

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
            let d8NewSiteInstaller = require('./d8/new-site-d8.js');
            return new d8NewSiteInstaller(this.args).newSiteSetup();
            break;
          case 'WordPress: Circle CI':
          case 'WordPress: Default':
            let wpNewSite = require('./wp/new-site-wp.js');
            wpNewSite(response);
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
