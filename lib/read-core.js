// read-core.js

exports.getDecoder = getDecoder;

var readUint8 = require("./read-format").readUint8;
var ReadToken = require("./read-token");

function getDecoder(options) {
  var readToken = ReadToken.getReadToken(options);
  return decode;

  function decode(decoder) {
    var type = readUint8(decoder);
    var func = readToken[type];
    if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
    return func(decoder);
  }
}
