build:	index.js

-include srcs.d

CORE_SRC_DIR = $(dir $(shell node -e "process.stdout.write(require.resolve('@upward/core-src'))"))

srcs.d: $(wildcard $(TSCONFIG)/../lib/*.ts)
	node_modules/.bin/js-makedepend -f $@ $(CORE_SRC_DIR)index.ts

index.js:
	tsc --project ${TSCONFIG} --outDir .

clean:
	-rm -rf lib index.js index.d.ts index.js.map srcs.d
