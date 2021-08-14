#!/usr/bin/env bash
echo "┏━━━ 🕵️‍♀️ LINT (parallel): eslint src --ext ts,js,tsx,jsx ━━━━━━━"
yarn lerna run lint --stream --concurrency 4