#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var Suite = require("msgpack-test-js").Suite;

var TITLE = __filename.split("/").pop();

var TEST_TYPES = {
  array: 1,
  bignum: 1,
  binary: 1,
  bool: 1,
  map: 1,
  nil: 1,
  number: 1,
  string: 1
};

var opt = {codec: msgpack.createCodec({int64: true})};

/**
 * @see https://github.com/kawanet/msgpack-test-suite/tree/master/src
 * @see https://github.com/kawanet/msgpack-test-js
 */

describe(TITLE, function() {
  var suite = new Suite();

  // get an array of groups
  suite.getGroups().forEach(function(group) {

    // get an array of exams
    suite.getExams(group).forEach(function(exam) {
      var types = exam.getTypes(TEST_TYPES);

      // skip when types not supported
      if (!types.length) return;

      var title = types[0] + ": " + exam.stringify(types[0]);
      it(title, function() {

        // test for encoding
        types.forEach(function(type) {
          var value = exam.getValue(type);
          var buffer = msgpack.encode(value, opt);
          assert(exam.matchMsgpack(buffer), exam.stringify(type));
        });

        // test for decoding
        var msgpacks = exam.getMsgpacks();
        msgpacks.forEach(function(encoded, idx) {
          var value = msgpack.decode(encoded, opt);
          assert(exam.matchValue(value), exam.stringify(idx));
        });
      });
    });
  });
});
