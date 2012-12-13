#!/bin/bash

node build/r.js -o build/optim.js
lessc client/less/main.less > build/output/css/main.css