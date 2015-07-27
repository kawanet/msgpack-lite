// cli.js

var fs = require("fs");
var Stream = require("stream");
var msgpack = require("../");

exports.CLI = CLI;

function help() {
  var cfgmap = {
    "M": "input MessagePack (default)",
    "J": "input JSON",
    "m": "output MessagePack (default)",
    "j": "output JSON",
    "h": "show help message",
    "1": "add spacer for JSON"
  };
  process.stderr.write("Usage: msgpack-lite -[flags] [infile] [outfile]\n");
  Object.keys(cfgmap).forEach(function(key) {
    process.stderr.write("  -" + key + "  " + cfgmap[key] + "\n");
  });
  process.exit(1);
}

function CLI() {
  var input;
  var pass = new Stream.PassThrough({objectMode: true});
  var output;

  var args = {};
  Array.prototype.forEach.call(arguments, function(val) {
    if (val[0] === "-") {
      val.split("").forEach(function(c) {
        args[c] = true;
      });
    } else if (!input) {
      input = val;
    } else {
      output = val;
    }
  });

  if (args.h) return help();
  if (!Object.keys(args).length) return help();

  if (input === "-") input = null;
  if (output === "-") output = null;
  input = input ? fs.createReadStream(input) : process.stdin;
  output = output ? fs.createWriteStream(output) : process.stdout;

  if (args.j) {
    encodeJSON(pass, output);
  } else {
    pass.pipe(msgpack.createEncodeStream()).pipe(output);
  }

  if (args.J) {
    decodeJSON(input, pass);
  } else {
    input.pipe(msgpack.createDecodeStream()).pipe(pass);
  }
}

function encodeJSON(input, output) {
  input.on("data", function(data) {
    output.write(JSON.stringify(data) + "\n");
  });
}

function decodeJSON(input, output) {
  var buf = "";
  input.on("data", function(chunk) {
    buf += chunk;
    check(true);
  });
  input.on("end", function() {
    check();
  });
  function check(leave) {
    var list = buf.split("\n");
    if (list.length < 2) return;
    if (leave) buf = list.pop();
    list.forEach(function(str) {
      if (!str.length) return;
      output.write(JSON.parse(str));
    });
  }
}