# Makefile includes for upward.
# Designed for use by tst subdirectory (include ../include.mk),
# or apps (include node_modules/upward/include.mk).

SELF_DIR 	:= $(dir $(lastword $(MAKEFILE_LIST)))

GIT_ROOT 	:= $(shell git rev-parse --show-toplevel)
GIT_DIR  	:= $(notdir $(GIT_ROOT))

NAME 		?= $(GIT_DIR)
ENTRY 		?= src/main.js
BUNDLE  	?= assets/bundle.js
BUNDLE_DIST	?= dist/assets/bundle.js

BUCKET		?= $(NAME)

RELOAD_PORT 	?= 32568
SERVER_PORT	?= 8081

WATCH_ROOT 	:= $(GIT_ROOT)
WATCH_TRIGGER 	?= $(NAME)
WATCH_FILES 	?= $(BUNDLE) index.html
WATCH_CMD	:= bash node_modules/upward/etc/reload $(RELOAD_PORT)

CLEAN 		:= $(BUNDLE) $(UGLIFIED_BUNDLE)


### BASIC RULES
# To specify a different default rule, place it in the including make file before the include.

.PHONY:	all build uglify

all:	build watch

build:	$(BUNDLE)

uglify:	$(UGLIFED_BUNDLE)


### BUNDLING

$(BUNDLE): 	$(ENTRY)
	watchify --transform babelify --debug $< --outfile $@

$(BUNDLE_DIST):	$(BUNDLE)
	uglifyjs $< --output $@ --mangle # -c --define TEST=false

### WATCHING

# SET UP WATCH
.PHONY: watch unwatch
watch:
	watchman -- trigger $(WATCH_ROOT) $(WATCH_TRIGGER) $(WATCH_FILES) -- $(WATCH_CMD)

unwatch:
	watchman trigger-del $(WATCH_ROOT) $(WATCH_TRIGGER)

# Extract source map:
# browserify main.js --debug -t babelify | exorcist bundle.js.map > $@


### SERVING
.PHONY: serve
serve:
	python -m SimpleHTTPServer $(SERVER_PORT) &
	node $(SELF_DIR)reload-server.js $(RELOAD_PORT)&


### UGLIFY

%.min.js:	%.js
	uglifyjs $< --output $@ # --mangle -c --define TEST=false --source-map=


### DEPLOY TO AWS
.PHONY: dist aws

dist: $(BUNDLE_DIST)

aws: dist
	aws s3 sync dist s3://$(BUCKET) --acl public-read

### CLEAN

.PHONY: clean
clean:
	@rm -rf $(CLEAN)
