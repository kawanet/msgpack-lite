// decoder.js

exports.Decoder = Decoder;

var EventLite = require("event-lite");
var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
var decodeAsync = require("./read-core").decodeAsync;

function Decoder(options) {
  if (!(this instanceof Decoder)) return new Decoder(options);
  DecodeBuffer.call(this, options);
}

Decoder.prototype = new DecodeBuffer();

EventLite.mixin(Decoder.prototype);

Decoder.prototype.decode = function(chunk) {
  if (chunk) this.append(chunk);
  decodeAsync(this);
};

Decoder.prototype.push = function(chunk) {
  this.emit("data", chunk);
};

Decoder.prototype.end = function(chunk) {
  this.decode(chunk);
  this.emit("end");
};
