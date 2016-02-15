// ext-codec.js

exports.Ext = Ext;
exports.createCodec = createCodec;

var ExtBuffer = require("./ext-buffer").ExtBuffer;
var IS_ARRAY = require('./is-array');

function Ext() {
  if (!(this instanceof Ext)) return new Ext();
  this.extPackers = {};
  this.extUnpackers = [];
}

function createCodec() {
  return new Ext();
}

Ext.prototype.addExtPacker = function(etype, Class, packer) {
  if (IS_ARRAY(packer)) {
    packer = join(packer);
  }
  var name = Class.name;
  if (name && name !== "Object") {
    this.extPackers[name] = extPacker;
  } else {
    var list = this.extEncoderList || (this.extEncoderList = []);
    list.unshift([Class, extPacker]);
  }

  function extPacker(value) {
    var buffer = packer(value);
    return new ExtBuffer(buffer, etype);
  }
};

Ext.prototype.addExtUnpacker = function(etype, unpacker) {
  this.extUnpackers[etype] = IS_ARRAY(unpacker) ? join(unpacker) : unpacker;
};

Ext.prototype.getExtPacker = function(value) {
  var c = value.constructor;
  var e = c && c.name && this.extPackers[c.name];
  if (e) return e;
  var list = this.extEncoderList;
  if (!list) return;
  var len = list.length;
  for (var i = 0; i < len; i++) {
    var pair = list[i];
    if (c === pair[0]) return pair[1];
  }
};

Ext.prototype.getExtUnpacker = function(type) {
  return this.extUnpackers[type] || extUnpacker;

  function extUnpacker(buffer) {
    return new ExtBuffer(buffer, type);
  }
};

function join(filters) {
  filters = filters.slice();

  return function(value) {
    return filters.reduce(iterator, value);
  };

  function iterator(value, filter) {
    return filter(value);
  }
}
