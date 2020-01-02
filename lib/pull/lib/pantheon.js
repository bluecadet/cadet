const utils = require('./utils.js');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { exec } = require('child_process');
const request = require('request');
const zlib = require("zlib");
const Rsync = require('rsync');
const mysql = require('mysql');

/**
 * Ping terminus to create a new backup, and then return the url
 * of the backup
 *
 * @param {object} site
 */
const createPantheonBackup = (site) => {

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
 *
 * @param {object} site
 * @param {number} bac_exp * Number of minutes that
 */
const getPantheonDatabaseBackupURL = (site, bac_exp) => {

  return new Promise((resolve, reject) => {

    if (bac_exp === 'override') {
      // Force flag, create new DB backup
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

          const BAC_TIME = parseInt(stdout.trim(), 10);
          const NOW = Math.floor(Date.now() / 1000);
          const MINUTES_DIFF = Math.floor((NOW - BAC_TIME) / 60);
          const IS_BAC_EXPIRED = bac_exp < MINUTES_DIFF;

          // console.log('last backup time: ' + BAC_TIME);
          // console.log('now:              ' + NOW);
          // console.log('MINUTES_DIFF:     ' + MINUTES_DIFF);
          // console.log('IS_BAC_EXPIRED:   ' + IS_BAC_EXPIRED);

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
 * Make a Pantheon DB backup, download it, load it into MAMP
 *
 */
const getPantheonDB = (site, cb) => {

  const CONNECTION_OPTS = {
    user : PROJECT_CONFIG.localDatabase.user,
    password : PROJECT_CONFIG.localDatabase.pass,
    socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
  };

  const SITE_PATH = utils.setupAssetPath(site, 'db');
  const DB_FILE_PATH = SITE_PATH + '/db.sql';
  // ------
  const DB_FRESHNESS = PROJECT_CONFIG.backup_expires;

  console.log(chalk.blue(`Checking for database backups for ${site}...`));

  let BAC_EXP = PROJECT_CONFIG.backup_expires;

  if (!BAC_EXP) {
    BAC_EXP = '60';
    console.log('='.repeat(process.stdout.columns));
    console.log(chalk.white("A value for '") +
                chalk.white.underline('backup_expires') +
                chalk.white("' has not been set in your `.bcdb.js` file. Either set a value manually in `.bcdb.js` or run ") +
                chalk.white.underline('bcdb init') +
                chalk.white(' to be prompted for a value.')
    );
    console.log(chalk.red('A default expiration value of ') +
                chalk.red.underline(BAC_EXP) +
                chalk.red(' (minutes) will be used until a value is set.')
    );
    console.log('='.repeat(process.stdout.columns));
  }

  getPantheonDatabaseBackupURL(site, BAC_EXP).then(backup_url => {

    console.log(chalk.blue(`...Downloading database backup...`));

    const requestStream = request(backup_url)
          .pipe(zlib.createGunzip())
          .pipe(fs.createWriteStream(DB_FILE_PATH));

    requestStream.on('finish', function () {

      console.log(chalk.blue(`...Importing database...`));

      // Connect to mysql, prep DB by dropping and creating
      const CONNECTION = mysql.createConnection(CONNECTION_OPTS);
      CONNECTION.connect();

      // Drop the DB
      CONNECTION.query('DROP DATABASE IF EXISTS `' + PROJECT_CONFIG.localDatabase.name + '`', function (err, results, fields) {
        if (err) {
          console.log(chalk.red(`ERROR @ CONNECTION.query('DROP DATABASE IF EXISTS...`));
          throw err;
        }
      });

      // Create the DB
      CONNECTION.query('CREATE DATABASE `' + PROJECT_CONFIG.localDatabase.name + '`', function (err, results, fields) {
        if (err) {
          console.log(chalk.red(`ERROR @ CONNECTION.query('CREATE DATABASE...`));
          throw Error(err);
        }
      });

      // When complete, import the DB
      CONNECTION.end(function(err) {
        if (err) {
          console.log(chalk.red(`ERROR @ CONNECTION.end`));
          throw Error(err);
        }

        // Import the DB once the connection has ended
        let command = '{executable} -u{username} -p{password} {database} < {file}';

        command = command.replace('{executable}', '/Applications/MAMP/Library/bin/mysql');
        command = command.replace('{username}', PROJECT_CONFIG.localDatabase.user);
        command = command.replace('{password}', PROJECT_CONFIG.localDatabase.pass);
        command = command.replace('{database}', PROJECT_CONFIG.localDatabase.name);
        command = command.replace('{file}', DB_FILE_PATH);

        exec(command, (err) => {
          if (err) {
            console.log(`Error @ /Applications/MAMP/Library/bin/mysql --user=${PROJECT_CONFIG.localDatabase.user} --password=${PROJECT_CONFIG.localDatabase.pass} ${PROJECT_CONFIG.localDatabase.name} < ${DB_FILE_PATH} > /dev/null 2>&1`)
            throw Error(err);
          } else {
            console.log(chalk.green('✨ Database import complete!'));

            // Callback
            cb();
          }
        });

      }); // end CONNECTION.end...

    }); // end requestStream.on('finish'...

  });
}


const getPantheonFiles = (site, data) => {

  const creds = JSON.parse(data);
  const SITE_PATH = utils.setupAssetPath(site, 'files');
  const FILES_PATH = path.join(utils.BCDB_PROJECT_PATH, PROJECT_CONFIG.file_path);
  const ryscExcludes = ['js', 'css', 'ctools', 'imagecache', 'xmlsitemap', 'backup_migrate', 'php/twig/*', 'styles', 'less'];

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

      console.log(chalk.green('💫 File import complete!'));

    }, function(data) {
      var out = data.toString('utf-8').split(/\r?\n/);
      console.log(out[0]);
    });

}


module.exports = {
  getPantheonDB,
  getPantheonFiles
}