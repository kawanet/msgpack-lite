// decoder.js

exports.Decoder = Decoder;

var EventLite = require("event-lite");
var decode = require("./read-core").decode;
var BUFFER_SHORTAGE = require("./common").BUFFER_SHORTAGE;

var DEFAULT_OPTIONS = {};

function Decoder(options) {
  if (!(this instanceof Decoder)) return new Decoder(options);
  this.options = options || DEFAULT_OPTIONS;
}

EventLite.mixin(Decoder.prototype);

Decoder.prototype.ondata = function(chunk) {
  this.emit("data", chunk);
};

Decoder.prototype.onend = function() {
  this.emit("end");
};

Decoder.prototype.decode = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? Buffer.concat([prev, chunk]) : chunk;
  this.bufferLength = this.buffer.length | 0;
  this.offset = 0;
  return this.flush();
};

Decoder.prototype.end = function(chunk) {
  if (arguments.length) this.decode(chunk);
  this.flush();
  if (this.onend) this.onend();
};

Decoder.prototype.flush = function() {
  var decoded;
  while (this.offset < this.bufferLength) {
    if (!this.__flush()) break;
    decoded = true;
  }
  return decoded;
};

Decoder.prototype.__flush = function() {
  if (!this.bufferLength) return;
  var start = this.offset;
  var value;
  try {
    value = decode(this);
  } catch (e) {
    if (e !== BUFFER_SHORTAGE) throw e;
    // rollback
    this.offset = start;
    return;
  }
  this.ondata(value);

  // indicates decode succeeded
  return true;
};
