// encoder.js

exports.Encoder = Encoder;

var EventLite = require("event-lite");
var encode = require("./write-core").encode;

var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;
var DEFAULT_OPTIONS = {};

function Encoder(options) {
  if (!(this instanceof Encoder)) return new Encoder(options);
  this.options = options || DEFAULT_OPTIONS;
}

EventLite.mixin(Encoder.prototype);

Encoder.prototype.ondata = function(chunk) {
  this.emit("data", chunk);
};

Encoder.prototype.onend = function() {
  this.emit("end");
};

Encoder.prototype.encode = function(chunk) {
  encode(this, chunk);
};

Encoder.prototype.end = function(chunk) {
  if (arguments.length) this.encode(chunk);
  this.flush();
  if (this.onend) this.onend();
};

Encoder.prototype.flush = function() {
  if (this.offset) {
    this.ondata(this.buffer.slice(0, this.offset));
    this.buffer = null;
    this.offset = 0;
  }
};

Encoder.prototype.reserve = function(length) {
  if (!this.buffer) return this.alloc(length);

  var size = this.buffer.length;

  // is it long enough?
  if (this.offset + length < size) return;

  // flush current buffer
  if (this.offset) this.flush();

  // resize it to 2x current length
  this.alloc(Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE)));
};

Encoder.prototype.alloc = function(length) {
  // allocate new buffer
  this.buffer = new Buffer(length > MIN_BUFFER_SIZE ? length : MIN_BUFFER_SIZE);
  this.offset = 0;
};

Encoder.prototype.send = function(buffer) {
  var end = this.offset + buffer.length;
  if (this.buffer && end < this.buffer.length) {
    buffer.copy(this.buffer, this.offset);
    this.offset = end;
  } else {
    this.flush();
    this.ondata(buffer);
  }
};
