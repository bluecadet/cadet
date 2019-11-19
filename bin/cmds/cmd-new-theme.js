
exports.command = 'new-theme'
exports.desc = 'Install new theme, either Drupal or Wordpress'
exports.builder = (yargs) => {

  return yargs
}
exports.handler = function (args) {

  let NewTheme = require('../../lib/new-theme/new-theme.js');
  let newTheme = new NewTheme(args);
  newTheme.run();
}
