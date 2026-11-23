var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

describe("short input diagnostics", function() {
  [Buffer.from, Array.from, Uint8Array.from.bind(Uint8Array)].forEach(function(from, index) {
    describe(["Buffer", "Array", "Uint8Array"][index], function() {
      it("explains an empty input", function() {
        check([]);
      });

      it("explains a truncated string payload", function() {
        check([0xa2, 0x61]);
      });

      it("explains an unsatisfied collection length", function() {
        check([0xdc, 0x00, 0x02, 0x01]);
        check([0xde, 0x00, 0x01, 0x01]);
      });

      function check(bytes) {
        assert.throws(function() {
          msgpack.decode(from(bytes));
        }, function(error) {
          assert.ok(error instanceof Error);
          assert.equal(error.code, "BUFFER_SHORTAGE");
          assert.match(error.message, /input buffer is too short/i);
          return true;
        });
      }
    });
  });

  it("keeps incomplete streaming values buffered until their remaining bytes arrive", function() {
    var decoder = new msgpack.Decoder();
    var values = [];
    decoder.on("data", value => values.push(value));
    decoder.decode(Buffer.from([0xa2, 0x61]));
    assert.deepEqual(values, []);
    decoder.decode(Buffer.from([0x62, 0xc2]));
    assert.deepEqual(values, ["ab", false]);
  });
});
