#!/usr/bin/env bash
echo "┏━━━ 🕵️‍♀️ LINT: eslint src --ext ts,js,tsx,jsx ━━━━━━━"
npx eslint src --ext ts,js,tsx,jsx --fix --no-error-on-unmatched-pattern