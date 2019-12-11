
let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'new-site'
exports.desc = 'Update composer files, etc. on a new site.'
exports.builder = (yargs) => {
  yargs
    .option('packages', {
      type: 'array',
      describe: 'Which groups of themes and modules.',
      default: ['adminTheme', 'devModules', 'baseBluecadet', 'baseWeb'],
      alias: 'p'
    })
    .help('h')
    .alias('h', 'help')
    .count('verbose')
    .alias('v', 'verbose');

  return yargs
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let NewSite = require('../../lib/new-site/new-site.js');
  let newSite = new NewSite(args);
  newSite.run();
}
