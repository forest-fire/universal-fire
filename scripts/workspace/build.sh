#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
  echo "┏━━━ 📦 Build/Bundle (es, cjs, types) ━━━━━━━"
  lerna run 
else
  cd "./packages/$1"
  echo "┏━━━ 📦 Build/Bundle [ packages/$1 ] (es, cjs, types) ━━━━━━━"
  ../../devops/build.js $1
  cd - > /dev/null
fi

