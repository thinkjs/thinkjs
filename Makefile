TESTS = test/
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS = --recursive
ISTANBUL = ./node_modules/.bin/istanbul
MOCHA = ./node_modules/mocha/bin/_mocha

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
	@$(ISTANBUL) cover --report html $(MOCHA) -- -t $(TIMEOUT) --recursive -R spec $(TESTS)

test-all: test test-cov

.PHONY: test-cov test test-all
