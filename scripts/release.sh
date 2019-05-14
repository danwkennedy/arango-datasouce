#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
)

function run {
  cd ../

  echo "-- Running tests"

  npm test

  echo "-- Updating version"

  replaceJsonProp "package.json" "version" "$VERSION"

  echo "-- Generating changelog"

  npm run changelog

  echo "-- Committing, tagging and pushing package.json and CHANGELOG.md"
  git commit package.json CHANGELOG.md -m "release: version $VERSION"
  git tag -f $VERSION
  git push -q origin master
  git push -q origin $VERSION

  echo "-- Version $VERSION pushed successfully"
}

source $(dirname $0)/utils.inc