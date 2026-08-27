#!/usr/bin/env bash -c make

SRC=./lib/browser.js
LIB=./index.js ./lib/*.js
TESTS=./test/*.js
HINTS=$(LIB) $(TESTS) ./*.json ./test/*.json
CLASS=msgpack
DIST=./dist
JSTEMP=./dist/msgpack.browserify.js
JSDEST=./dist/msgpack.min.js
MINJS_MAX_BYTES := 60000
NAMED_EXPORTS := encode decode Encoder Decoder createCodec
NODE_ONLY_EXPORTS := createEncodeStream createDecodeStream

all: $(JSDEST)

clean:
	rm -fr $(JSDEST) $(JSTEMP)

$(DIST):
	mkdir -p $(DIST)

$(JSTEMP): $(LIB) $(DIST)
	./node_modules/.bin/browserify -s $(CLASS) $(SRC) -o $(JSTEMP) --debug

$(JSDEST): $(JSTEMP)
	./node_modules/.bin/uglifyjs $(JSTEMP) -c "arrows=false" -m "reserved=[Buffer]" -o $(JSDEST)
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MINJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MINJS_MAX_BYTES) byte cap" >&2; exit 1; }

test: jshint mocha test-dep smoke-minjs

mocha:
	./node_modules/.bin/mocha -R spec $(TESTS)

jshint:
	./node_modules/.bin/jshint $(HINTS)

# Requiring the library must stay silent. Deprecation warnings only
# surface under --pending-deprecation, so ask for them explicitly.
test-dep:
	! node --pending-deprecation --trace-deprecation ./index.js 2>&1 | grep .

# Smoke the bundle in both consumer shapes: a browser <script>, where the
# UMD wrapper leaves a namespace global behind once the CommonJS branch is
# out of the way, and a CJS require(), which is how bundlers pull the same
# file in from a CDN.
smoke-minjs: $(JSDEST)
	(echo 'module = void 0; exports = void 0;' && cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof $(CLASS)[k] !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	(echo 'module = void 0; exports = void 0;' && cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof $(CLASS)[k] !== "undefined") { console.error("unexpected browser export:", k); process.exit(1); }}') | node - $(NODE_ONLY_EXPORTS)
	node --input-type=commonjs -e 'const m = require("$(JSDEST)"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

.PHONY: all clean test jshint mocha test-dep smoke-minjs
