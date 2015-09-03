// read-core.js

exports.decode = decode;
exports.decodeAsync = decodeAsync;

var uint8 = require("./read-format").format.uint8;
var token = require("./read-token").token;
var BUFFER_SHORTAGE = require("./common").BUFFER_SHORTAGE;

function decode(decoder) {
  var type = uint8(decoder);
  var func = token[type];
  if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
  return func(decoder);
}

function decodeAsync(decoder) {
  while (decoder.offset < decoder.buffer.length) {
    var start = decoder.offset;
    var value;
    try {
      value = decode(decoder);
    } catch (e) {
      if (e !== BUFFER_SHORTAGE) throw e;
      // rollback
      decoder.offset = start;
      break;
    }
    decoder.push(value);
  }
}
