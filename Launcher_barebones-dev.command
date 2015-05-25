#!/bin/sh
here="`dirname \"$0\"`"
cd "$here"
cmd="./launcher | ./server -skipmidi -skipkinect -skipcolour -devmode -verbose"
eval $cmd