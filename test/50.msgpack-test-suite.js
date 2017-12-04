#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var Exam = require("msgpack-test-js").Exam;

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

  // find exams for types supported by the library
  Exam.getExams(TEST_TYPES).forEach(function(exam) {

    // find types tested by the exam
    var types = exam.getTypes(TEST_TYPES);
    var first = types[0];
    var title = first + ": " + exam.stringify(first);
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
