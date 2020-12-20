#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
  echo "┏━━━ 🕵️‍♀️ LINT: eslint src --ext ts,js,tsx,jsx ━━━━━━━"
  yarn lerna run lint --stream --concurrency 1
else
  cd "./packages/$1"
  echo "┏━━━ 🕵️‍♀️ LINT SRC ($1): eslint src --ext ts,js,tsx,jsx ━━━━━━━"
  eslint src --ext ts,js,tsx,jsx
  echo "┏━━━ 🕵️‍♀️ LINT TEST ($1): eslint test --ext ts,js,tsx,jsx ━━━━━━━"
  eslint test --ext ts,js,tsx,jsx
  cd - > /dev/null
fi

