// bufferish-util.js

exports.fromString = fromString;

var Bufferish = require("./bufferish");
var BufferProto = require("./bufferish-proto");

/**
 * @private
 */

function fromString(value) {
  var expected = value.length * 3;
  var that = Bufferish.alloc.call(this, expected);
  var actual = BufferProto.write.call(that, value);
  if (expected !== actual) {
    that = BufferProto.slice.call(that, 0, actual);
  }
  return that;
}
