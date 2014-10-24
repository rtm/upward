JS = $(shell find src sample -name "[A-Za-z]*.js")

TOUCH = $(addprefix tmp/,$(JS))

.PHONY: all realAll tests

all: realAll
	@true

tests:
	$(MAKE) -C tests

realAll: $(TOUCH) #  tests

tmp/%.js: %.js
	-@traceur --experimental $<
	@touch $@

clean:
	@rm -f $(TOUCH)

.PHONY: clean
