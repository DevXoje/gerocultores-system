#!/usr/bin/env bash
# scripts/create-sprint.sh
# Usage: ./scripts/create-sprint.sh <sprint-number>
# Example: ./scripts/create-sprint.sh 4
#
# Creates sprint/S{N} from develop, pushes it to origin,
# and prints the next steps.

set -e

# ── Validation ──────────────────────────────────────────────────────────────
if [ -z "$1" ]; then
  echo "❌  Usage: $0 <sprint-number>"
  echo "   Example: $0 4"
  exit 1
fi

N="$1"
BRANCH="sprint/S${N}"
CURRENT_BRANCH=$(git branch --show-current)

# ── Ensure we're on develop and it's up to date ──────────────────────────────
echo "🔄  Switching to develop and pulling latest..."
git checkout develop
git pull origin develop

# ── Check branch doesn't already exist ───────────────────────────────────────
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  echo "⚠️   Branch '${BRANCH}' already exists locally."
  echo "   If you want to reset it: git branch -D ${BRANCH} && $0 ${N}"
  exit 1
fi

if git ls-remote --exit-code --heads origin "${BRANCH}" > /dev/null 2>&1; then
  echo "⚠️   Branch '${BRANCH}' already exists on origin."
  echo "   Checking it out locally instead..."
  git checkout --track "origin/${BRANCH}"
  echo ""
  echo "✅  Checked out existing remote branch '${BRANCH}'."
  exit 0
fi

# ── Create and push ──────────────────────────────────────────────────────────
echo "🌿  Creating branch '${BRANCH}' from develop..."
git checkout -b "${BRANCH}"

echo "🚀  Pushing '${BRANCH}' to origin..."
git push -u origin "${BRANCH}"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✅  Sprint branch ready: ${BRANCH}"
echo ""
echo "📋  Next steps:"
echo "   1. Update PLAN/current-sprint.md with Sprint S${N} details"
echo "   2. Create task branches from '${BRANCH}':"
echo "      git checkout ${BRANCH}"
echo "      git checkout -b feat/US-XX-short-description"
echo "   3. Open PRs targeting '${BRANCH}', not develop"
echo "   4. When the sprint closes, open PR: ${BRANCH} → develop"
echo ""
echo "🔗  GitHub: https://github.com/DevXoje/gerocultores-system/tree/${BRANCH}"
