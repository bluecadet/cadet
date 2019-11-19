
function Logger(config) {
  this.verboseLvl = config;

  this.log = (message, lvl=0) => {
    // console.log(message, lvl, this.verboseLvl);

    if (lvl <= this.verboseLvl) {
      console.log(message);
    }
  }
}

module.exports = Logger;
