// ext.js

var exports = module.exports = Ext;
var encoders = exports.encoders = {};
var decoders = exports.decoders = [];
exports.Error = {name: 1, message: 1};

var encode = require("./encode").encode;
var decode = require("./decode").decode;

function Ext(type, className) {
  if (!(this instanceof Ext)) return new Ext(type, className);
  if ("string" === typeof type) type = type.charCodeAt(0);
  this.type = type;
  encoders["[object " + className + "]"] = this;
  decoders[type] = this;
}

Ext.prototype.encoder = function(encoder) {
  this.encode = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.decoder = function(decoder) {
  this.decode = Array.prototype.reduce.call(arguments, join);
  return this;
};

function join(prev, current, idx) {
  return function(value) {
    return current(prev(value));
  };
}

Ext("D", "Date").encoder(Number, encode).decoder(decode, create(Date));
Ext("E", "Error").encoder(map(exports.Error), encode).decoder(decode, encodeError);
Ext("R", "RegExp").encoder(encodeRegExp, encode).decoder(decode, decodeRegExp);
Ext("N", "Number").encoder(Number, encode).decoder(decode, create(Number));
Ext("S", "String").encoder(String, encode).decoder(decode, create(String));

function encodeError(value) {
  var out = new Error();
  for (var key in exports.Error) {
    out[key] = value[key];
  }
  return out;
}

function encodeRegExp(value) {
  return RegExp.prototype.toString.call(value).split("/").slice(1);
}

function decodeRegExp(value) {
  return RegExp.apply(null, value);
}

function create(Class) {
  return function(value) {
    return new Class(value);
  };
}

function map(fields) {
  return function(value) {
    var out = {};
    for (var key in fields) {
      out[key] = value[key];
    }
    return out;
  };
}
