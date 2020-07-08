let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'new-site'
exports.desc = 'Update composer files, etc. on a new site.'
exports.builder = (yargs) => {
  yargs
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
