// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Stream = require("stream");
var encode = require("./encode").encode;

util.inherits(EncodeStream, Stream.Duplex);

function EncodeStream() {
  if (!(this instanceof EncodeStream)) return new EncodeStream();
  Stream.Duplex.call(this, {objectMode: true});

  // input stream
  var input = Stream.PassThrough({objectMode: true});
  this._write = input.write.bind(input);

  // output stream
  var output = Stream.PassThrough();
  output.on("data", this.push.bind(this));
  output.on("end", this.emit.bind(this, "end"));
  this._read = function() {
    return false;
  };

  encode(input, output);
}