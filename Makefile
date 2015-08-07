SRC = $(wildcard src/*.js)

upward.js: $(SRC)
	browserify $^ -t babelify -r ./src/Up.js:fuck --outfile $@
