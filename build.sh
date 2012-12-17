#!/bin/bash

rm -rf build/output
node build/r.js -o build/optim.js
./node_modules/less/bin/lessc client/less/main.less > build/output/css/main.css