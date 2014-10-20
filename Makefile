JS = $(shell find src sample -name "[A-Za-z]*.js")
TOUCH = $(addprefix tmp/,$(JS))


.PHONY: all realAll

all: realAll
	@true

realAll: $(TOUCH)

tmp/%.js: %.js
	-@traceur --experimental $<
	@touch $@

clean:
	@rm -f $(TOUCH)

.PHONY: clean
