#! /bin/bash
set -euo pipefail

node_bin="./node_modules/.bin"
compiled_dir="compiled"
bundled_dir="bundled"

resources=(
  popup/popup
  background/background
)

# If no alternate build tool is specified, use browserify.
# watchify has the same API, but watches the source files.
bundle_using="${1-browserify}"

mkdir -p $bundled_dir

# Copy over already bundled dependencies from node_modules
cp node_modules/webextension-polyfill/dist/browser-polyfill.min.js ./$bundled_dir
cp node_modules/draft-js/dist/Draft.css ./$bundled_dir

# Copy CSS styles from emoji-mart library
cp node_modules/emoji-mart/css/emoji-mart.css ./$bundled_dir

# Write out a conf.js file with configuration variables
echo "window.roarServerUrl = '${ROAR_SERVER_URL-"https://roar-server.herokuapp.com"}';" > ./$bundled_dir/conf.js

# Build the bundles in parallel.
# Note that this is explicitly necessary when using watchify because those will never exit
for resource in "${resources[@]}"; do
  $node_bin/$bundle_using $compiled_dir/$resource.js -o $bundled_dir/$resource.js &
done

wait
