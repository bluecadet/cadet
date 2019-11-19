
exports.command = 'init-site'
exports.desc = 'Fully create a new site with pantheon build tools.'
exports.builder = (yargs) => {

  return yargs
}
exports.handler = function (args) {

  let InitSite = require('../../lib/init-site/init-site.js');
  let initSite = new InitSite(args);
  initSite.run();

}
