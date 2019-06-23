# Makefile for @upweard/sam-src

SERVER_PORT	:= 8082

build:	../sam/index.js

../sam/index.js: $(shell find *.ts) tsconfig.json
	tsc

# include node_modules/upward/etc/upward.mk
