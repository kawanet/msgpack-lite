// read-core.js

exports.decode = decode;

var uint8 = require("./read-format").format.uint8;
var token = require("./read-token").token;

function decode(decoder) {
  var type = uint8(decoder);
  var func = token[type];
  if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
  return func(decoder);
}
