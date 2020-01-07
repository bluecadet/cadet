const os = require('os');
const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');
const { exec } = require('child_process');
const chalk = require('chalk');
const creds = require('../../utils/credentials.js');
const request = require('request');
const zlib = require("zlib");
const Rsync = require('rsync');
const mysql = require('mysql');
const argv = require('yargs').argv;






/**
 * Ping terminus to create a new backup, and then return the url
 * of the backup
 *
 * @param {object} site
 */
 function createPantheonBackup(site) {

  return new Promise((resolve, reject) => {
    exec(`terminus backup:create --element=db  ${site}`, (err, stdout, stderr) => {
      if (err) {
        reject();
        console.log(chalk.red(`ERROR @ terminus backup:create --element=db  ${site}`));
        throw Error(err);
      }

      // Get the newly created backup
      exec(`terminus backup:get --element=db  ${site}`, (err, stdout, stderr) => {
        if (err) {
          reject();
          console.log(chalk.red(`ERROR @ terminus backup:get --element=db  ${site}`));
          throw Error(err);
        }

        resolve(stdout);
      });
    });
  });
}



/**
 * getPantheonDatabaseBackupURL()
 *
 * @param {object} site
 * @param {number} bac_exp * Number of minutes that
 */
 function getPantheonDatabaseBackupURL(site, bac_exp) {

  return new Promise((resolve, reject) => {

    // Check if backup creation should be forced
    if (bac_exp === 'override') {
      console.log(chalk.yellow(`...force flag - Creating a new database backup...`));

      createPantheonBackup(site)
        .catch(err => {
          throw Error(err);
        })
        .then(url => {
          resolve(url);
        });

    } else {

      exec(`terminus backup:info --field=date ${site}`, (err, stdout, stderr) => {
        if (err) {
          // A database backup hasn't been created yet, so create a new one
          console.log(chalk.blue(`...Creating a new database backup...`));

          createPantheonBackup(site)
            .catch(err => {
              throw Error(err);
            })
            .then(url => {
              resolve(url);
            });

        } else {

          // Check database by dates
          const BAC_TIME = parseInt(stdout.trim(), 10);
          const NOW = Math.floor(Date.now() / 1000);
          const MINUTES_DIFF = Math.floor((NOW - BAC_TIME) / 60);
          const IS_BAC_EXPIRED = bac_exp < MINUTES_DIFF;

          if ( IS_BAC_EXPIRED ) {

            // Database is older than desired setting
            console.log(chalk.blue(`...Creating a new database backup...`));

            createPantheonBackup(site)
              .catch(err => {
                throw Error(err);
              })
              .then(url => {
                resolve(url);
              });

          } else {

            // Database is newer than desired setting
            console.log(chalk.blue('...Using latest backup (created ') +  chalk.cyan(MINUTES_DIFF + ' minutes') + chalk.blue(' ago)...'));

            exec(`terminus backup:get --element=db  ${site}`, (err, stdout, stderr) => {
              if (err) {
                reject();
                console.log(chalk.red(`ERROR @ terminus backup:get --element=db  ${site}`));
                throw Error(err);
              }

              resolve(stdout);
            });
          }
        }
      });

    }

  });
}


/**
 * importBackupToMamp()
 *
 * @param {object} dbConfig json object containing db details
 * @param {number} DB_FILE Path to sql file to import
 */
function importBackupToMamp(dbConfig, DB_FILE) {

  return new Promise((resolve, reject) => {

    console.log(chalk.blue(`...Importing database...`));

    const CONNECTION_OPTS = {
      user : dbConfig.db_user,
      password : dbConfig.db_pass,
      socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
    };

    // Connect to mysql, prep DB by dropping and creating
    const CONNECTION = mysql.createConnection(CONNECTION_OPTS);
    CONNECTION.connect();

    // Drop the DB
    CONNECTION.query('DROP DATABASE IF EXISTS `' + dbConfig.db_name + '`', function (err, results, fields) {
      if (err) {
        console.log(chalk.red(`ERROR @ CONNECTION.query('DROP DATABASE IF EXISTS...`));
        throw err;
      }
    });

    // Create the DB
    CONNECTION.query('CREATE DATABASE `' + dbConfig.db_name + '`', function (err, results, fields) {
      if (err) {
        console.log(chalk.red(`ERROR @ CONNECTION.query('CREATE DATABASE...`));
        throw Error(err);
      }
    });

    // When complete, import the DB
    CONNECTION.end( function (err) {

      if (err) {
        console.log(chalk.red(`ERROR @ CONNECTION.end`));
        reject();
        throw Error(err);
      }

      // Import the DB once the connection has ended
      let command = '{executable} -u{username} -p{password} {database} < {file}';

      command = command.replace('{executable}', '/Applications/MAMP/Library/bin/mysql');
      command = command.replace('{username}', dbConfig.db_user);
      command = command.replace('{password}', dbConfig.db_pass);
      command = command.replace('{database}', dbConfig.db_name);
      command = command.replace('{file}', DB_FILE);

      exec(command, (err) => {
        if (err) {
          console.log(`Error @ /Applications/MAMP/Library/bin/mysql --user=${dbConfig.db_user} --password=${dbConfig.db_pass} ${dbConfig.db_name} < ${DB_FILE} > /dev/null 2>&1`)
          reject();
          throw Error(err);
        }

        console.log(chalk.green('\n✨ Database import complete!'));
        return resolve();
      });

    });

  });
}



/**
 * Get SFTP Connection info from Pantheon
 *
 */
function getPantheonConnectionData(siteName) {

  return new Promise((resolve, reject) => {

    console.log(chalk.blue(`\nPreparing to pull files from ${siteName}...`));

    exec(`terminus connection:info ${siteName} --format=json --fields=sftp_username,sftp_host`, (err, stdout, stderr) => {
      if (err) {
        console.log(`Error @ getPantheonConnectionData() -> exec()`);
        console.log(err);
        reject(err);
        return;
      }

      let data = stdout;

      resolve(data);

    });

  });
}



/**
 * getPantheonEnvsArray(siteName)
 * ------------------------------
 * Get an array of available Pantheon environments
 *
 * @param siteName [string] the name of the Pantheon site
 * @return array
 *
 */
exports.getPantheonEnvsArray = (siteName) => {

  return new Promise((resolve, reject) => {

    exec(`terminus env:list ${siteName} --format=csv --fields=id`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      // Strip ID and empty from list
      let list = stdout.split('\n');

      list.shift();
      list.pop();

      list.splice(list.indexOf('dev'), 1);
      list.splice(list.indexOf('test'), 1);
      list.splice(list.indexOf('live'), 1);

      list.splice(0, 0, 'live');
      list.splice(0, 0, 'test');
      list.splice(0, 0, 'dev');

      resolve(list);
    });
  });
}



/**
 * Make a Pantheon DB backup, download it, load it into MAMP
 *
 */
exports.getPantheonDB = (site, dbConfig) => {

  return new Promise((resolve, reject) => {

    const TMP_STORE_PATH = path.join(creds.getTempStorageDir(), site);

    // Make sure tmp file path exists
    fsx.ensureDir(TMP_STORE_PATH)
      .then(() => {

        const DB_FILE = path.join(TMP_STORE_PATH, 'db.sql');
        let BAC_EXP = dbConfig.bac_exp ? dbConfig.bac_exp : 60;

        // Remove any old sql files
        fsx.removeSync(DB_FILE);

        console.log(chalk.blue(`\nChecking for database backups for ${site}...`));

        // Check for existing backups, then download as needed
        getPantheonDatabaseBackupURL(site, BAC_EXP)
          .then((backup_url) => {
            console.log(chalk.blue(`...Downloading database backup...`));

            // Download and unzip the file, save to temp storage dir
            const requestStream = request(backup_url)
              .pipe(zlib.createGunzip())
              .pipe(fs.createWriteStream(DB_FILE));

            // When the zip file is downloaded and unzipped...
            requestStream.on('finish', () => {

              // Import the sql file to MAMP
              importBackupToMamp(dbConfig, DB_FILE)
                .then(() => {
                  resolve();
                });
            });
          })
          .catch(err => {
            console.log(err);
          });

      });
  });
}



/**
 * Get Files from Pantheon
 */
exports.getPantheonFiles = (site, dbCreds) => {
  getPantheonConnectionData(site)
    .then(data => {

      const creds = JSON.parse(data);
      const FILES_PATH = path.join(process.cwd(), dbCreds.file_path);
      const ryscExcludes = ['js', 'css', 'ctools', 'imagecache', 'xmlsitemap', 'backup_migrate', 'php/twig/*', 'styles', 'less'];

      fsx.ensureDirSync(FILES_PATH);

      // Allow custom excludes via the --excludes= param
      if ( argv.exclude ) {
        let excludes = argv.exclude;

        if (excludes.indexOf(',') > -1) {
          excludes = excludes.split(',');
          excludes.forEach( (x) => {
            ryscExcludes.push(x);
          });
        } else {
          ryscExcludes.push(excludes);
        }
      }

      let rsync = new Rsync()
        .flags('r', 'v', 'l', 'z')
        .chmod('u=rwx,g=rx,o=rx')
        .set('copy-unsafe-links')
        .set('size-only')
        .set('ipv4')
        .set('out-format', '%n')
        // .progress()
        .exclude(ryscExcludes)
        .shell('ssh -p 2222')
        .source(`${creds.sftp_username}@${creds.sftp_host}:files/`)
        .destination(FILES_PATH);

        console.log(chalk.blue(`...Syncing files...`));

        rsync.execute(function(err, code, cmd) {
          if (err) {
            console.log(chalk.red('Error @ rsync'));
            console.log(err);
            throw Error(err);
          }

          console.log(chalk.green('\n💫 File import complete!'));

        }, function(data) {
          var out = data.toString('utf-8').split(/\r?\n/);
          console.log(out[0]);
        });
    });

}