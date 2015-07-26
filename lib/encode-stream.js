// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Encoder = require("./encoder").Encoder;

util.inherits(EncodeStream, Transform);

function EncodeStream() {
  if (!(this instanceof EncodeStream)) return new EncodeStream();
  Transform.call(this, {objectMode: true});
  var encoder = new Encoder();
  encoder.push = this.push.bind(this);
  this._transform = encoder._transform.bind(encoder);
}
