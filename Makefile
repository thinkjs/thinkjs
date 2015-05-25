TESTS = test/
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS = --recursive
ISTANBUL = ./node_modules/.bin/istanbul
MOCHA = ./node_modules/mocha/bin/_mocha
BABEL = ./node_modules/.bin/babel-node

install:
	@npm install
	@$(BABEL) src/ --out-dir lib/

test: install
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)
	@NODE_ENV=test ./node_modules/jshint/bin/jshint lib/

test-cov:
	@$(ISTANBUL) cover --report html $(MOCHA) -- -t $(TIMEOUT) --recursive  -R spec $(TESTS)

test-travis:
	@NODE_ENV=test ./node_modules/jshint/bin/jshint lib/
	@$(ISTANBUL) cover --report lcov $(MOCHA) -- -t $(TIMEOUT) --recursive  -R spec $(TESTS)

test-all: test test-cov

.PHONY: test-cov test test-all
