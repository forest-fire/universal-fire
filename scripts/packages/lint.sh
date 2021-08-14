#!/usr/bin/env bash

echo "┏━━━ 🕵️‍♀️ LINT: SRC folder in $(pwd) ━━━━━━━"
npx eslint src --ext ts,js,tsx,jsx --fix --no-error-on-unmatched-pattern

echo "┏━━━ 🕵️‍♀️ LINT: TEST folder in $(pwd) ━━━━━━━"
npx eslint test --ext ts,js,tsx,jsx --fix --no-error-on-unmatched-pattern
