let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../../utils/credentials.js');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');


module.exports = function(args) {
  // console.log(args);

  log(chalk.green("Setting up your WordPress site... \n"), 0);

  const rootPath   = process.cwd();
  let wpConfigDir;
  let wpConfigData;

  fsx.pathExists(path.join(rootPath, 'web/index.php'))
    .then((isWebRoot) => {
      const dbConfig   = creds.getLocalDbCreds();
      const localGulp  = path.join(rootPath, '.local-gulpconfig.json');
      let useLocalSite = false;
      let localSuffix  = isWebRoot ? '/wp' : '';

      if (fs.existsSync( localGulp )) {
        const g_config = JSON.parse(fs.readFileSync(localGulp));
        if (g_config.proxy == null) {
          log(chalk.yellow("*********************************************\nYou will need to add values for WP_HOME and\nWP_SITEURL definitions in wp-config-local.php\n*********************************************\n"), 0);
        } else {
          useLocalSite = g_config.proxy;
        }
      } else {
        log(chalk.yellow("*********************************************\nYou will need to add values for WP_HOME and\nWP_SITEURL definitions in wp-config-local.php\n*********************************************\n"), 0);
      }

wpConfigData = `
<?php

/*
  * Set Site URL
  */`;

if ( useLocalSite ) {
wpConfigData += `
define( 'WP_HOME', ${useLocalSite} );
define( 'WP_SITEURL', '${useLocalSite}${localSuffix}' );

`;
} else {
wpConfigData += `
// define( 'WP_HOME', 'http://hostname.local' );
// define( 'WP_SITEURL', 'http://hostname.local${localSuffix}' );

`;
}

wpConfigData += `
/*
  * Set Database Details
  */
define( 'DB_NAME', '${dbConfig.db_name}' );
define( 'DB_USER', '${dbConfig.db_user}' );
define( 'DB_PASSWORD', '${dbConfig.db_pass}' );
define( 'DB_HOST', '${dbConfig.db_host}' );

/*
  * Set debug modes
  */
define( 'WP_DEBUG', 'true' );
define( 'IS_LOCAL', true );
define( 'WP_ENV', 'development' );

`;



      if (isWebRoot) {
        wpConfigDir = path.join(rootPath, 'web');
      } else {
        wpConfigDir = rootPath;
      }
    })
    .then(() => {
      const wpLocalFile = path.join(wpConfigDir, 'wp-config-local.php');
      fsx.outputFile(wpLocalFile, wpConfigData);
      log(chalk.blue("...wp-config-local.php file written..."), 0);
    })
    .then(() => {
      log(chalk.green("🎉 Have fun developing!"), 0);
    });

}