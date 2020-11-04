#! /bin/bash
set -euo pipefail

git_branch=${GITHUB_REF##*/}
git_hash=$(git rev-parse --short "$GITHUB_SHA")
artifact_name="$git_branch @$git_hash"

PUBLISH_DIR=publish

ARTIFACT_FILE_NAME="artifacts/$artifact_name.zip"

# Build the project pointing to https://roar-server.herokuapp.com
ENV=stage npm run build

mkdir $PUBLISH_DIR

# Copy over the following resources
for resource in bundled html img; do
  cp -R $resource ./$PUBLISH_DIR
done

NAME="Roar $artifact_name"

cat manifest.json | sed "s/Roar Local/$NAME/" > ./$PUBLISH_DIR/manifest.json

ROOT=$(pwd)

mkdir -p artifacts

cd $PUBLISH_DIR && zip -r -FS "$ROOT/$ARTIFACT_FILE_NAME" * && cd $ROOT

# git_branch=$git_branch git_hash=$git_hash artifact_name=$artifact_name ./slack.js
