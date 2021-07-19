#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
  echo "┏━━━ 🎯 TEST: $(1) ━━━━━━━"
  yarn lerna run test --stream --scope "$1"
else
  echo "┏━━━ 🎯 TEST: all packages ━━━━━━━━━━━━━━━━━━━"
  yarn lerna run test --stream --concurrency 4