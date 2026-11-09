#!/bin/bash
fail=0
for t in fit qualrules ladder skills age-decimal cutoff import-quals import-rules qb qb-input qb-starters qb-compose csrf calendar mocktest mockjson mocksections attempt mockanalytics parser paperreader preferences; do
  f="prisma/check-$t.ts"
  [ -f "$f" ] || { echo "skip  $t (no file)"; continue; }
  if npx tsx "$f" > /tmp/check-$t.log 2>&1; then echo "ok    $t"; else echo "FAIL  $t (see /tmp/check-$t.log)"; fail=1; fi
done
npm run build > /tmp/build.log 2>&1 && echo "ok    build" || { echo "FAIL  build"; fail=1; }
exit $fail
