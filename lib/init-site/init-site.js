let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');
const setCircleCMS = require('./shared/circle-ci-setup.js');

function InitSite(args) {
  this.args = args;

  this.run = () => {
    // console.log(args);

    // github credentials (global)
    creds.initGithubCreds()
      .then((response) => {
        // Pantheon credentials (site)
        return creds.initPanthCreds();
      }).then((response) => {
        // Local Database credentials (site)
        return creds.initLocalDbCreds();
      }).then((response) => {
        // log(response);

        // Run WP/Drupal init.
        switch (response.format) {
          case 'Drupal 8: Circle CI':
          case 'Drupal 8: Default':
            let d8InitSiteInstaller = require('./d8/init-site-d8.js');
            new d8InitSiteInstaller(this.args).initSiteSetup();
            setCircleCMS('D8');
            break;

          case 'WordPress: Circle CI':
          case 'WordPress: Default':
            let wpInit = require('./wp/init-site-wp.js');
            setCircleCMS('WP')
              .then(() => {
                wpInit();
              });
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
