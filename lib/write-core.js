// write-core.js

exports.encode = encode;

var type = require("./write-type").type;

function encode(encoder, value) {
  var func = type[typeof value];
  if (!func) throw new Error("Unsupported type \"" + (typeof value) + "\": " + value);
  func(encoder, value);
}
