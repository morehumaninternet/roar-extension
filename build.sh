#! /bin/bash
set -euo pipefail

# Build Variables ###

stylesheets_to_compile=(
  popup.scss
)

scripts_to_bundle=(
  popup/popup.tsx
  background/background.ts
)

### Build Logic ###

node_bin="./node_modules/.bin"
bundled_dir="bundled"

echo "Clearing $bundled_dir directory"
rm -rf $bundled_dir && mkdir -p $bundled_dir

for stylesheet in "${stylesheets_to_compile[@]}"; do
  input_file=scss/$stylesheet
  output_file=$bundled_dir/"${stylesheet%%.*}".css
  echo "Compiling $input_file as $output_file"
  $node_bin/sass $@ $input_file $bundled_dir/"${stylesheet%%.*}".css &
done

for script in "${scripts_to_bundle[@]}"; do
  input_file=src/$script
  output_file=bundled/"${script%%.*}".js
  ROAR_SERVER_URL="${ROAR_SERVER_URL-"https://roar-server.herokuapp.com"}" \
    $node_bin/rollup $input_file $@ --file $output_file --config rollup.config.js &
done

# Wait on the running jobs, if any of them failed, just kill the rest
FAILED=false

for job in $(jobs -p); do
  if $FAILED; then
    kill -9 $job
  else
    wait $job || FAILED=true
  fi
done
