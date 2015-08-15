# Makefile includes for upward

UGLIFYJS := uglifyjs
UGLIFYJS_OPTIONS :=


# UGLIFY
%.min.js:	%.js
	$(UGLIFYJS) $(UGLIFYJS_OPTIONS) $< --source-map=$*.min.js.map --output $@ # --mangle -c --define TEST=false
