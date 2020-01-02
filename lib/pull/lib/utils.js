const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
const { exec } = require('child_process');
const chalk = require('chalk');

// const homedir = os.homedir();
const BCDB_INFO_DIR = path.join(os.homedir(), '.bcdb');
const BCDB_INFO_FILE = path.join(BCDB_INFO_DIR, 'bcdb.js');

const BCDB_PROJECT_PATH = process.cwd();
const BCDB_PROJECT_FILE = path.join(BCDB_PROJECT_PATH, '.bcdb.js');

exports.BCDB_INFO_DIR = BCDB_INFO_DIR;
exports.BCDB_INFO_FILE = BCDB_INFO_FILE;
exports.BCDB_PROJECT_PATH = BCDB_PROJECT_PATH;
exports.BCDB_PROJECT_FILE = BCDB_PROJECT_FILE;

const CMS_OPTIONS = [
  'Drupal 8: Circle CI',
  'Drupal 8: Default',
  'WordPress: Circle CI',
  'WordPress: Default',
  'Custom File Path'
];

exports.CMS_OPTIONS = CMS_OPTIONS;


exports.cmsFilePath = (cms) => {

  if (cms === 'Drupal 8: Circle CI') {
    return `/web/sites/default/files`;
  } else if (cms === 'Drupal 8: Default') {
    return `/sites/default/files`;
  } else if (cms === 'WordPress: Circle CI') {
    return `/web/wp-content/uploads`;
  } else if (cms === 'WordPress: Default') {
    return `/wp-content/uploads`;
  } else {
    return '/files';
  }

}



exports.getPantheonEnvsArray = (siteName, cb) => {
  exec(`terminus env:list ${siteName} --format=csv --fields=id`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
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

    cb(list);
  });
}


exports.getPantheonConnectionData = (siteName, cb) => {
  console.log(chalk.blue(`Preparing to pull files from ${siteName}...`));
  exec(`terminus connection:info ${siteName} --format=json --fields=sftp_username,sftp_host`, (err, stdout, stderr) => {
    if (err) {
      console.log(`Error @ getPantheonConnectionData() -> exec()`);
      console.log(err);
      return;
    }

    let data = stdout;

    cb(siteName, data);

  });
}



exports.setupAssetPath = (site, assetDir) => {
  const site_obj = site.split('.');
  const SITENAME = site_obj[0];

  const SITE_PATH = path.resolve(BCDB_INFO_DIR, `${SITENAME}/${assetDir}`);

  // Add site/db folder to ~/.bcdb config folder
  fsx.ensureDir(SITE_PATH, err => {
    if (err) {
      console.log(`ERROR @ fsx.ensureDir`);
      console.log(err);
      return;
    }
  });

  // Empty site/db folder to ~/.bcdb config folder
  fsx.emptyDirSync(SITE_PATH);

  return SITE_PATH;
}




exports.prettyUpdate = function (update){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(update);
}