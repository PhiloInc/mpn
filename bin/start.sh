#!/bin/bash

DIR="$(command cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

npm start | ./node_modules/.bin/bunyan
