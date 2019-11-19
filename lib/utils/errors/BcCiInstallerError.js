
function bcCiInstallerError(msg, status) {
  this.msg = msg;
  this.status = status;

  this.toString = function () {
    return this.status + ": "+ this.msg;
  };
}

module.exports = bcCiInstallerError;
