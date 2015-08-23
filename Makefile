#!/usr/bin/env bash -c make

SRC=./lib/browser.js
LIB=./index.js ./lib/*.js
TESTS=./test/*.js
TESTS_BROWSER=./test/[12]?.*.js
HINTS=$(LIB) $(TESTS) ./*.json ./test/*.json
CLASS=msgpack
DIST=./dist
JSTEMP=./dist/msgpack.browserify.js
JSDEST=./dist/msgpack.min.js
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

test:
	@if [ "x$(BROWSER)" = "x" ]; then make test-node; else make test-browser; fi

mocha:
	$(MOCHA) -R spec $(TESTS)

jshint:
	$(JSHINT) $(HINTS)

test-node: jshint mocha

test-browser:
	./node_modules/.bin/zuul -- $(TESTS_BROWSER)

test-browser-local:
	./node_modules/.bin/zuul --local 4000 -- $(TESTS_BROWSER)

bench:
	node lib/benchmark.js 1

.PHONY: all clean test jshint mocha bench test-node test-browser test-browser-local
