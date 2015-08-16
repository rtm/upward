# Makefile includes for upward.
# Designed for use by tst subdirectory (include ../include.mk),
# or apps (include node_modules/upward/include.mk).

RELOAD_HOST ?= 32568

# Path to this include file; used to locate create-watch.js.
SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

# Top of repo.
GIT_ROOT := $(shell git rev-parse --show-toplevel)
WATCH_ROOT := $(GIT_ROOT)

# Things to clean; add to this in your own makefile using CLEAN +=
CLEAN := make.d watch.list watch.json $(BUNDLE) $(UGLIFIED_BUNDLE)


### VARIABLES
# Assumes the following variables are set correctly:
# TRIGGER: name of watchman trigger to set
# BUNDLE:  name of bundle to create
# ENTRY:   starting point for creating bundle


### BASIC RULES
# To specify a different default rule, place it in the including make file before the include.

.PHONY:	all build uglify

all:	build watch

build:	$(BUNDLE)

uglify:	$(UGLIFED_BUNDLE)


### BUNDLING

# Call browserify to create bundle.
# It appears browserify cannot create a list at the same time as the bundle.
# So we have to call it twice.
# See https://github.com/substack/node-browserify/issues/1355.
#
$(BUNDLE): 	$(ENTRY)
	@echo Browserifying JavaScript in $(NAME).
	browserify --transform babelify --debug $< --outfile $@
	-curl --silent localhost:$(RELOAD_HOST)


### WATCHING

# SET UP WATCH
.PHONY: watch
watch: watch.json
	cat $< | watchman -j

# Create a JSON file as input to watchman.
# Pass the list of dependencies, and the directory one level above.
# This file will be used in the `watch` rule.
watch.json: watch.list
	node $(SELF_DIR)create-watch.js $< $(WATCH_ROOT) $(TRIGGER) $(PWD)> $@

.PHONY: unwatch
unwatch:
	watchman trigger-del $(WATCH_ROOT) $(TRIGGER)

# Make a make-style dependency list from the list created by browserify.
# This file is included at the top of this makefile.
make.d:	watch.list
	cat $< | sed "s~^~$(BUNDLE) watch.list: ~" > $@

# Run browserify to create a list of all modules referenced.
# This will be transformed into a JSON set of instructions to watchman (watch.json).
watch.list:
	browserify -t babelify $(ENTRY) --list > $@


# Extract source map:
# browserify main.js --debug -t babelify | exorcist bundle.js.map > $@



### UGLIFY

%.min.js:	%.js
	uglifyjs $< --source-map=$*.min.js.map --output $@ # --mangle -c --define TEST=false


### CLEAN

.PHONY: clean
clean:
	@rm -rf $(CLEAN)
