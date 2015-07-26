// pseudo-stream.js

module.exports = PseudoStream;

var EventLite = require("event-lite");

EventLite.mixin(PseudoStream.prototype);

function PseudoStream(opts) {
  if (!(this instanceof PseudoStream)) return new PseudoStream();
  if (opts && opts.objectMode) this.objectMode = true;
}

PseudoStream.prototype.write = function(chunk) {
  var array = this.buffer || (this.buffer = []);
  return array.push(chunk);
};

PseudoStream.prototype.read = function() {
  var array = this.buffer;
  if (!array) return;
  if (this.objectMode) return array.shift();
  delete this.buffer;
  return Buffer.concat(array);
};
