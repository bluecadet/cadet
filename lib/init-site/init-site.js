let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');

function InitSite(args) {
  this.args = args;

  this.run = () => {
    // console.log('TODO: init-site');
    console.log(args);

    creds.initGithubCreds()
      .then((response) => {
        // log(response);

        return creds.initPanthCreds();
      }).then((response) => {
        // log(response);

        return creds.initLocalDbCreds();
      }).then((response) => {
        log(response);

        // Run WP/Drupal init.
        switch (response.format) {
          case 'Drupal 8: Circle CI':
          case 'Drupal 8: Default':
            let d8InitSiteInstaller = require('./d8/init-site-d8.js');
            return new d8InitSiteInstaller(this.args).initSiteSetup();
            break;

          case 'WordPress: Circle CI':
          case 'WordPress: Default':
            let wpNewSiteInstaller = require('./wp/init-site-wp.js');
            return new wpInitSiteInstaller(this.args).initSiteSetup();
            break;

          default:
            return
        }

      }).catch((error) => {
        log(error, 2);
      });
  }
}

module.exports = InitSite;
