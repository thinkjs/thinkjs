TESTS = test/*.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =

install:
	@npm install

test: install
	@NODE_ENV=test /usr/local/bin/mocha \
	--reporter $(REPORTER) \
    --timeout $(TIMEOUT) \
    $(MOCHA_OPTS) \
    $(TESTS)

test-cov:
	@URLRAR_COV=1 $(MAKE) test MOCHA_OPTS='--require blanket'

test-all: test test-cov

.PHONY: test-cov test test-all