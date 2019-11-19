
exports.command = 'new-site'
exports.desc = 'Update composer files, etc. on a new site.'
exports.builder = (yargs) => {

  return yargs
}
exports.handler = function (args) {

  let NewSite = require('../../lib/new-site/new-site.js');
  let newSite = new NewSite(args);
  newSite.run();
}
