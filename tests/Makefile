JS = $(shell ls *.js)
JS_COMPILED = $(addprefix compiled/,$(JS))

.PHONY: all realAll tests

all: realAll
	@true

realAll: tests

tests: $(JS_COMPILED)

compiled/%.js: %.js
	-@traceur --experimental --source-maps --modules inline --out $@ $< 

clean:
	rm $(JS_COMPILED)

.PHONY: clean
