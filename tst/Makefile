# Makefile for upward/tst

BROWSERIFY := browserify
BROWSERIFY_OPTIONS := --transform babelify

WATCHMAN := watchman

BUNDLE := dist/bundle.js
ENTRY := src/main.js
RELOAD_HOST := 32568

include make.d

.PHONY:	watch all build uglify

all:	build watch

build:	$(BUNDLE)

uglify:	$(BUNDLE:js=min.js)


# Create a JSON file as input to watchman.
# Pass the list of dependencies, and the directory one level above.
# This file will be used in the `watch` rule.
watch.json: watch.list
	node ../etc/create-watch.js $< $(dir $(PWD)) > $@


# Set up the watch.
watch: watch.json
	cat $< | $(WATCHMAN) -j

unwatch:
	$(WATCHMAN) trigger-del /home/rtm/repos/rtm/upward tst

# CREATE BUNDLE.
# It appears browserify cannot create a list at the same time as the bundle.
# So we have to call it twice.
# See https://github.com/substack/node-browserify/issues/1355.
#
$(BUNDLE): 	src/main.js
	echo Browserifying JavaScript in tst.
	$(BROWSERIFY) $(BROWSERIFY_OPTIONS) --debug $< --outfile $@
	-curl --silent localhost:$(RELOAD_HOST)


# Extract source map:
# browserify main.js --debug -t babelify | exorcist bundle.js.map > $@


# Make a make-style dependency list from the list created by browserify.
# This file is included at the top of this makefile.
make.d:	watch.list
	cat $< | sed "s~^~dist/bundle.js: ~" > $@


# Run browserify to create a list of all modules referenced.
# This will be transformed into a JSON set of instructions to watchman.
watch.list: $(BUNDLE)
	$(BROWSERIFY) $(BROWSERIFY_OPTIONS) $(ENTRY) --list > $@

clean:
	@rm -rf make.d watch.list watch.json $(BUNDLE)
