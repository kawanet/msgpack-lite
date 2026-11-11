# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

TEST_SRC := ../test/[12]*.js ../test/6[12]*.js
TEST_DST := tests/bundled.mjs
BUFFER_SRC := ../node_modules/buffer/index.js
BUFFER_DST := tests/buffer.shim.js

# CI sets CDP_PORT to attach to a running Chrome over CDP instead of installing one.
PLAYWRIGHT_CONFIG := tests/playwright-config.json

ALL := $(TEST_DST) $(BUFFER_DST) $(PLAYWRIGHT_CONFIG)

all: dist $(ALL)

bundled: all

install:
	if [ -z "$(CDP_PORT)" ]; then \
		cd .. && node ./node_modules/.bin/playwright install chromium --only-shell --with-deps; \
	fi

dist:
	$(MAKE) -C .. dist/msgpack.min.js

test: all install
	cd .. && node ./node_modules/.bin/chromium-js \
	--playwright-config browser/$(PLAYWRIGHT_CONFIG) \
	--script browser/tests/buffer.shim.js \
	--script dist/msgpack.min.js \
	--alias msgpack-lite=browser/import.mjs \
	--test browser/tests/bundled.mjs

$(PLAYWRIGHT_CONFIG): Makefile
	mkdir -p $(dir $@)
	if [ -n "$(CDP_PORT)" ]; then \
		echo '{"connectOverCDP": "http://127.0.0.1:$(CDP_PORT)"}' > $@; \
	else \
		echo '{}' > $@; \
	fi

$(TEST_DST): $(TEST_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(TEST_SRC) --format esm \
	--plugin '@rollup/plugin-alias={entries:[{find:"../index",replacement:"msgpack-lite"}]}' \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'node:assert,node:test,msgpack-lite' \
	--file $@
	perl -i -pe 's#^(import) (require.*from)#$$1 * as $$2#' $@

$(BUFFER_DST): $(BUFFER_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $< --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-node-resolve \
	--banner "const {Buffer} = " \
	--file $@

clean:
	/bin/rm -fr $(ALL)

.PHONY: all bundled dist install test clean
