#!/bin/bash
# Usage: ./prisma/ship.sh "commit message"
[ -z "$1" ] && { echo 'Usage: ./prisma/ship.sh "commit message"'; exit 1; }
./prisma/check-all.sh || { echo "NOT committed: a check failed."; exit 1; }
git add -A -- ':!public/org-logos' ':!public/state-logos' ':!prisma/org-logos.csv'
git status --short
git commit -m "$1" && git push
