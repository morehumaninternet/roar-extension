#! /bin/bash
set -e

if [ "$#" -lt 2 ]; then
  echo "Please specify TARGET and VERSION"
  exit 1
fi

TARGET="$1"
VERSION="$2"

[ "$TARGET" == "stage" ] || [ "$TARGET" == "production" ] || {
  echo "TARGET must be stage or production, got $TARGET"
  exit 1
}

[[ $VERSION =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]] || {
  echo "VERSION must be a semantic version number x.y.z, got $VERSION"
  exit 1
}

PUBLISH_DIR=publish/$TARGET/$VERSION

ARTIFACT_FILE_NAME="artifacts/$TARGET v$VERSION.zip"

# Abort if the zip file already exists
if [ -f "$ARTIFACT_FILE_NAME" ]; then
  echo "$ARTIFACT_FILE_NAME already exists, aborting"
  exit 1
fi

# Build the project pointing to https://roar-server.herokuapp.com
ROAR_SERVER_URL=https://roar-server.herokuapp.com npm run build

# Clear and remake the publish directory
rm -rf $PUBLISH_DIR && mkdir -p $PUBLISH_DIR

# Copy over the following resources
for resource in bundled css html img; do
  cp -R $resource ./$PUBLISH_DIR
done

# Write over the proper conf.js file based on the environment. Ignore the one at the root level.
if [[ $TARGET == "production" ]]; then
  NAME="Roar"
else
  NAME="Roar Stage"
fi

cat manifest.json | sed "s/1.0.0/$VERSION/" | sed "s/Roar Local/$NAME/" > ./$PUBLISH_DIR/manifest.json

ROOT=$(pwd)

mkdir -p artifacts

cd $PUBLISH_DIR && zip -r -FS "$ROOT/$ARTIFACT_FILE_NAME" * && cd $ROOT
