# Makefile for upward/tst

NAME := tst
BUNDLE := dist/bundle.js
UGLIFIED_BUNDLE := $(BUNDLE:js=min.js)
ENTRY := src/main.js
TRIGGER := tst

-include                     ../etc/upward.mk   # upward/tst case
-include    node_modules/upward/etc/upward.mk   # app case
-include ../node_modules/upward/etc/upward.mk   # app/tst case


# DEPENDENCIES
include make.d
