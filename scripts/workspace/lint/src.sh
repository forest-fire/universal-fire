#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
  echo "┏━━━ 🕵️‍♀️ LINT: lint all repos SRC folders ━━━━━━━"
  yarn lerna run lint --stream --concurrency 1
else
  cd "./packages/$1"
  echo "┏━━━ 🕵️‍♀️ LINT SRC ($1): eslint src --ext ts,js,tsx,jsx ━━━━━━━"
  eslint src --ext ts,js,tsx,jsx --fix
  cd - > /dev/null
fi

