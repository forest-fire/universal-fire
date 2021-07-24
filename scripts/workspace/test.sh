#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
echo "┏━━━ 🎯 TEST: all packages ━━━━━━━━━━━━━━━━━━━"
  yarn lerna run test --stream --concurrency 4
else
  if [[ -z "$2" ]]; then 
    echo "┏━━━ 🎯 TEST: ($1) ━━━━━━━━━━━━━━━━━━━"
  else
    echo "┏━━━ 🎯 TEST: ($1: $2) ━━━━━━━━━━━━━━━━━━━"
  fi
  cd packages/$1
  npx jest $2
  cd - > /dev/null
fi