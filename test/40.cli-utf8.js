var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var fs = require("fs");
var os = require("os");
var path = require("path");
var spawnSync = require("child_process").spawnSync;
var msgpack = require("../index");

describe("CLI UTF-8 input", function() {
  // The first byte of the euro sign is the last byte of a 64 KiB file chunk.
  var value = "a".repeat(65534) + "\u20ac\ud83d\ude00";

  it("preserves a JSON string spanning file chunks", function() {
    var result = convert("-Jm", JSON.stringify(value));
    var decoded = msgpack.decode(result);
    assert.equal(decoded.slice(65534), value.slice(65534));
    assert.equal(decoded, value);
  });

  it("preserves UTF-8 in newline-separated JSON input", function() {
    var result = convert("-Sj", JSON.stringify(value) + "\n" + JSON.stringify("next") + "\n");
    var decoded = result.toString("utf8").trim().split("\n").map(JSON.parse);
    assert.equal(decoded[0].slice(65534), value.slice(65534));
    assert.deepEqual(decoded, [value, "next"]);
  });
});

function convert(flags, text) {
  var directory = fs.mkdtempSync(path.join(os.tmpdir(), "msgpack-cli-utf8-"));
  var input = path.join(directory, "input.json");
  try {
    fs.writeFileSync(input, text);
    var result = spawnSync(process.execPath, [path.join(__dirname, "../bin/msgpack"), flags, input], {
      timeout: 10000
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr.toString());
    return result.stdout;
  } finally {
    fs.unlinkSync(input);
    fs.rmdirSync(directory);
  }
}
