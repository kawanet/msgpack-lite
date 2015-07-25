#!/usr/bin/env bash -c make

SRC=./index.js
LIB=./lib/*.js
TESTS=./test/*.js
JSON=./*.json
CLASS=msgpack
DIST=./dist
JSTEMP=./dist/msgpack.browserify.js
JSDEST=./dist/msgpack.min.js
JSHINT=./node_modules/.bin/jshint
UGLIFYJS=./node_modules/.bin/uglifyjs
BROWSERIFY=./node_modules/.bin/browserify
MOCHA=./node_modules/.bin/mocha

all: $(JSDEST)

clean:
	rm -fr $(JSDEST) $(DOC_HTML)

$(DIST):
	mkdir -p $(DIST)

$(JSTEMP): $(SRC) $(LIB) $(DIST)
	$(BROWSERIFY) -s $(CLASS) $(SRC) -o $(JSTEMP) --debug

$(JSDEST): $(JSTEMP) $(DIST)
	$(UGLIFYJS) $(JSTEMP) -c -m -o $(JSDEST)

test: jshint mocha

mocha:
	$(MOCHA) -R spec $(TESTS)

jshint:
	$(JSHINT) $(SRC) $(LIB) $(JSON) $(TESTS)

.PHONY: all clean test jshint mocha
