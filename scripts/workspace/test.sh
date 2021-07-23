#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
echo "┏━━━ 🎯 TEST: all packages ━━━━━━━━━━━━━━━━━━━"
  yarn lerna run test --stream --concurrency 4
else
  echo "┏━━━ 🎯 TEST: ($1) ━━━━━━━━━━━━━━━━━━━"
  cd packages/$1
  npx jest
  cd - > /dev/null
fi