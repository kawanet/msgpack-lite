var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

describe("malformed UTF-8 strings", function() {
  var cases = [
    [[0xc2], "\ufffd"],
    [[0xe2, 0x82], "\ufffd"],
    [[0xf0, 0x9f, 0x92], "\ufffd"],
    [[0xe2, 0x28, 0xa1], "\ufffd(\ufffd"],
    [[0xe2, 0x82, 0x41], "\ufffdA"],
    [[0xc0, 0xaf], "\ufffd\ufffd"],
    [[0x80], "\ufffd"],
    [[0xf5, 0x80, 0x80, 0x80], "\ufffd\ufffd\ufffd\ufffd"],
    [[0xf4, 0x90, 0x80, 0x80], "\ufffd\ufffd\ufffd\ufffd"],
    [[0xe0, 0x80, 0xaf], "\ufffd\ufffd\ufffd"]
  ];

  cases.forEach(function(sample) {
    it("replaces malformed bytes without reading the next field: " + sample[0], function() {
      var bytes = [0x92, 0xa0 + sample[0].length].concat(sample[0], [42]);
      var inputs = [bytes, new Uint8Array(bytes), Buffer.from(bytes)];
      inputs.forEach(function(input) {
        assert.deepEqual(msgpack.decode(input), [sample[1], 42]);
      });
    });
  });

  it("preserves valid boundary code points and legacy CESU-8", function() {
    var bytes = [0xae, 0xc2, 0x80, 0xe0, 0xa0, 0x80, 0xed, 0x9f, 0xbf,
      0xf4, 0x8f, 0xbf, 0xbf, 0x41, 0x42];
    assert.equal(msgpack.decode(bytes), "\u0080\u0800\ud7ff\udbff\udfffAB");
    assert.equal(msgpack.decode([0xa6, 0xed, 0xa0, 0xbd, 0xed, 0xb0, 0xa6]), "\ud83d\udc26");
  });
});
