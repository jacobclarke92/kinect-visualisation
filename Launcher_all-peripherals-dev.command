#!/bin/sh
here="`dirname \"$0\"`"
cd "$here"
cmd="./launcher | ./server -skipcolour -devmode -verbose"
eval $cmd