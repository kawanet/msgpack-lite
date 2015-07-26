#!/usr/bin/env bash -c make

SRC=./lib/browser.js
LIB=./index.js ./lib/*.js
TESTS=./test/*.js
TESTS_BROWSER=./test/[12]?.*.js
HINTS=./*.json ./bench/bench.js
CLASS=msgpack
DIST=./dist
JSTEMP=./public/msgpack.browserify.js
JSDEST=./dist/msgpack.min.js
TESTDEST=./public/test.browserify.js
JSHINT=./node_modules/.bin/jshint
UGLIFYJS=./node_modules/.bin/uglifyjs
BROWSERIFY=./node_modules/.bin/browserify
MOCHA=./node_modules/.bin/mocha

all: test $(JSDEST) $(TESTDEST)

clean:
	rm -fr $(JSDEST) $(DOC_HTML)

$(DIST):
	mkdir -p $(DIST)

$(JSTEMP): $(LIB) $(DIST)
	$(BROWSERIFY) -s $(CLASS) $(SRC) -o $(JSTEMP) --debug

$(JSDEST): $(JSTEMP) $(DIST)
	$(UGLIFYJS) $(JSTEMP) -c -m -o $(JSDEST)

$(TESTDEST): $(TESTS_BROWSER)
	$(BROWSERIFY) $(TESTS_BROWSER) -o $(TESTDEST) --debug

test: jshint mocha

mocha:
	$(MOCHA) -R spec $(TESTS)

jshint:
	$(JSHINT) $(LIB) $(HINTS) $(TESTS)

.PHONY: all clean test jshint mocha
