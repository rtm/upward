
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
# cjs dependencies
# es6 dependencies
/home/rtm/repos/rtm/upward/pkg/core-src/index.ts: \
	../core-src/lib/index.ts

../core-src/lib/index.ts: \
	../core-src/lib/Cnt.ts \
	../core-src/lib/Txt.ts \
	../core-src/lib/Upw.ts

../core-src/lib/Cnt.ts: \
	../../node_modules/rxjs/Observable.js \
	../../node_modules/rxjs/add/observable/interval.js

../core-src/lib/Upw.ts: \
	../../node_modules/rxjs/Observable.js \
	../../node_modules/rxjs/Subject.js \
	../../node_modules/rxjs/add/observable/of.js \
	../../node_modules/rxjs/add/observable/pairs.js \
	../../node_modules/rxjs/add/operator/map.js \
	../core-src/lib/Cfg.js

