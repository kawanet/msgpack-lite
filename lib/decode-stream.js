// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Stream = require("stream");
var decode = require("./decode").decode;

util.inherits(DecodeStream, Stream.Duplex);

function DecodeStream() {
  if (!(this instanceof DecodeStream)) return new DecodeStream();
  Stream.Duplex.call(this, {objectMode: true});

  // input stream
  var input = Stream.PassThrough();
  this._write = input.write.bind(input);

  // output stream
  var output = Stream.PassThrough({objectMode: true});
  output.on("data", this.push.bind(this));
  output.on("end", this.emit.bind(this, "end"));
  this._read = function() {
    return false;
  };

  decode(input, output);
}