// pseudo-stream.js

module.exports = PseudoStream;

var EventLite = require("event-lite");

EventLite.mixin(PseudoStream.prototype);

function PseudoStream(opts) {
  if (!(this instanceof PseudoStream)) return new PseudoStream(opts);
  if (opts && opts.objectMode) this.objectMode = true;
}

PseudoStream.prototype.write = function(chunk) {
  // flowing mode
  var ret = this.emit("data", chunk);
  if (ret) return ret;

  // paused mode
  var buffer = this.buffer || (this.buffer = []);
  return buffer.push(chunk);
};

PseudoStream.prototype.end = function(chunk, encoding, callback) {
  if (chunk) this.write(chunk, encoding);
  this.emit("end");
  this.off("data");
  this.off("end");
  if (callback) callback();
};

PseudoStream.prototype.read = function() {
  var buffer = this.buffer;
  if (!buffer) return;

  // Object mode
  if (this.objectMode) return buffer.shift();

  // Buffer mode
  delete this.buffer;
  return Buffer.concat(buffer);
};

var _on = PseudoStream.prototype.on;
PseudoStream.prototype.on = function(type, func) {
  if (type === "data") {
    while (this.buffer && this.buffer.length) {
      func(this.read());
    }
  }
  _on.apply(this, arguments);
};
