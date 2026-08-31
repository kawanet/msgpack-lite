#!/usr/bin/env bash -c make

TEST_SRC := ../test/[12]*.js ../test/6[12]*.js
TEST_DST := tests/bundled.js
BUFFER_SRC := ../node_modules/buffer/index.js
BUFFER_DST := tests/buffer.shim.js
ASSERT_SRC := ../node_modules/assert/assert.js
ASSERT_DST := tests/assert.shim.js

ALL := $(TEST_DST) $(BUFFER_DST) $(ASSERT_DST)

all: $(ALL)

test: all

$(TEST_DST): $(TEST_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(TEST_SRC) --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../index' |\
	perl -pe 's#^}\)\(require.*\);#})(assert, msgpack)#' > $@

$(BUFFER_DST): $(BUFFER_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $< --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-node-resolve \
	--name "__BUFFER__" | \
	perl -pe 's#^var __BUFFER__#const {Buffer}#' > $@

$(ASSERT_DST): $(ASSERT_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $< --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-node-resolve \
	--name "assert" > $@

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test
