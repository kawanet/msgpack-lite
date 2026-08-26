#!/usr/bin/env bash -c make

SRC=./lib/browser.js
LIB=./index.js ./lib/*.js
TESTS=./test/*.js
HINTS=$(LIB) $(TESTS) ./*.json ./test/*.json
CLASS=msgpack
DIST=./dist
JSTEMP=./dist/msgpack.browserify.js
JSDEST=./dist/msgpack.min.js

all: test $(JSDEST)

clean:
	rm -fr $(JSDEST) $(JSTEMP)

$(DIST):
	mkdir -p $(DIST)

$(JSTEMP): $(LIB) $(DIST)
	./node_modules/.bin/browserify -s $(CLASS) $(SRC) -o $(JSTEMP) --debug

$(JSDEST): $(JSTEMP)
	./node_modules/.bin/uglifyjs $(JSTEMP) -c -m -r Buffer -o $(JSDEST)
	ls -l $(JSDEST)

test: jshint mocha test-dep

mocha:
	./node_modules/.bin/mocha -R spec $(TESTS)

jshint:
	./node_modules/.bin/jshint $(HINTS)

# Requiring the library must stay silent. Deprecation warnings only
# surface under --pending-deprecation, so ask for them explicitly.
test-dep:
	! node --pending-deprecation --trace-deprecation ./index.js 2>&1 | grep .

bench:
	node lib/benchmark.js 1

.PHONY: all clean test jshint mocha test-dep bench
