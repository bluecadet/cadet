
exports.command = 'init-site'
exports.desc = 'Fully create a new site with pantheon build tools.'
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

  let InitSite = require('../../lib/init-site/init-site.js');
  let initSite = new InitSite(args);
  initSite.run();

}
