
exports.command = 'pull'
exports.desc = 'Pull down db and files assets from host.'
exports.builder = (yargs) => {

  return yargs
}
exports.handler = function (args) {

  let Pull = require('../../lib/pull/pull.js');
  let pull = new Pull(args);
  pull.run();
}
