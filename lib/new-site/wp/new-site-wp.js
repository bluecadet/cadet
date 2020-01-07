let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../../utils/credentials.js');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');


module.exports = function(args) {

  log(chalk.green("Setting up your WordPress site... \n"), 0);

  const rootPath = process.cwd();
  const dbConfig = creds.getLocalDbCreds();
  const localGulp = path.join(rootPath, '.local-gulpconfig.json');
  let useLocalSite = false;

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

let wpConfigData = `
<?php

  /*
   * Set Site URL
   */`;

if ( useLocalSite ) {
wpConfigData += `
  define( 'WP_HOME', ${useLocalSite} );
  define( 'WP_SITEURL', ${useLocalSite} . 'wp/' );

`;
} else {
wpConfigData += `
  // define( 'WP_HOME', ADD_SITE_URL );
  // define( 'WP_SITEURL', ADD_SITE_URL . 'wp/' );

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

`;

  let wpConfigDir;

  fsx.pathExists(path.join(rootPath, 'web/index.php'))
    .then((exists) => {
      if (exists) {
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
      const wpConfigFile = path.join(wpConfigDir, 'wp-config.php');
      fsx.copy(path.resolve(__dirname, 'src/wp-config.php'), wpConfigFile);
      log(chalk.blue("...wp-config.php file replaced...\n"), 0);
    })
    .then(() => {
      log(chalk.green("🎉 Have fun developing!"), 0);
    });






}