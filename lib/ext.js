// ext.js

var exports = module.exports = Ext;
var encoders = exports.encoders = {};
var decoders = exports.decoders = [];

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

// 0x44
Ext("D", "Date").encoder(Number, encode).decoder(decode, decodeDate);

// 0x52
Ext("R", "RegExp").encoder(encodeRegExp, encode).decoder(decode, decodeRegExp);

function decodeDate(value) {
  return new Date(value);
}

function encodeRegExp(value) {
  return RegExp.prototype.toString.call(value).split("/").slice(1);
}

function decodeRegExp(value) {
  return RegExp.apply(null, value);
}
