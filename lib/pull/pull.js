const init = require('./lib/init.js');
// const pantheon = require('./lib/pantheon.js');

function Pull(args) {
  this.args = args;

  this.run = () => {
    console.log('TODO: pull')

    if (this.args && this.args._.includes('init')) {
      init();
    } else {
      console.log('Run it');
    }
  }
}

module.exports = Pull;
