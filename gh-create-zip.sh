#! /bin/bash
set -euo pipefail

git_branch=${GITHUB_REF##*/}
git_hash=$(git rev-parse --short "$GITHUB_SHA")
artifact_name="roar-extension-$git_branch-$GITHUB_RUN_NUMBER@$git_hash"

mkdir publish
mkdir artifacts

# Copy over the following resources to the publish directory
for resource in bundled html img; do
  cp -R $resource ./publish
done

# Copy over a manifest.json with an updated name
sed "s/Roar Local/Roar $artifact_name/" < manifest.json > ./publish/manifest.json

# Zip the publish folder as the artifact name
cd publish && zip -r -FS "../artifacts/$artifact_name.zip" *
