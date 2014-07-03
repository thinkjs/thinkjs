TESTS = test/test/*.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =

install:
	@npm install

test: install
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)
	@NODE_ENV=test ./node_modules/jshint/bin/jshint lib/

test-cov:
	@URLRAR_COV=1 $(MAKE) test MOCHA_OPTS='--require blanket -R html-cov > coverage.html'

test-all: test test-cov

.PHONY: test-cov test test-all