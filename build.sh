#!/bin/bash

rm -rf build/output
node build/r.js -o build/optim.js
lessc client/less/main.less > build/output/css/main.css