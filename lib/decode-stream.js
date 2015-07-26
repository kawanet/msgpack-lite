// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Decoder = require("./decoder").Decoder;

util.inherits(DecodeStream, Transform);

function DecodeStream() {
  if (!(this instanceof DecodeStream)) return new DecodeStream();
  Transform.call(this, {objectMode: true});
  var decoder = new Decoder(this);
  this._transform = decoder.decode.bind(decoder);
}
