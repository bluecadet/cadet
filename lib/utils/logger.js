
function Logger(lvl = 0) {
  this.verboseLvl = lvl;
  this.count = 0;
  this.printedCount = 0;

  this.log = (message, lvl = 0) => {

    this.count += 1;
    if (lvl <= this.verboseLvl) {
      this.printedCount += 1;
      console.log(message);
    }

  }

  this.setVerb = (lvl) => {
    this.verboseLvl = lvl;
  }

}

var Singleton = (function () {
  var instance;

  function createInstance() {
    var object = new Logger();
    return object;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };

})();

module.exports = Singleton;
