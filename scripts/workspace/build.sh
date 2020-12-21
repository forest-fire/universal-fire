#!/usr/bin/env bash

if [[ -z "$1" ]]; then 
  echo "┏━━━ 📦 Build/Bundle Monorepo ━━━━━━━"
  lerna run build --stream
else
  cd "./packages/$1"
  echo "┏━━━ 🧹 Clean [ packages/$1 ] (es, cjs, types) ━━━━━━━"
  yarn clean
  echo "┏━━━ 📦 Build/Bundle [ packages/$1 ] (es, cjs, types) ━━━━━━━"
  ../../devops/build.js $1
  cd - > /dev/null
fi

