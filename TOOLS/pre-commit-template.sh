#!/bin/sh
# =============================================================================
# pre-commit-template.sh
# gerocultores-system — Mass-Deletion Guardrail Pre-commit Hook
# =============================================================================
#
# PURPOSE:
#   Prevent accidental mass-deletion of files in a single commit.
#   If more than 10 files are staged for deletion, this hook aborts
#   the commit and instructs the developer to use a Pull Request instead.
#
# INSTALLATION (run once per local clone):
#   cp TOOLS/pre-commit-template.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# NOTE:
#   This hook is NOT installed automatically. It is the developer's
#   responsibility to install it. See CONTRIBUTING.md for details.
#
# BYPASS (use only when explicitly approved via PR):
#   git commit --no-verify -m "chore: approved mass-deletion (PR #XX)"
#
# Authors: Jose Vilches Sánchez / ANDRES MARTOS GAZQUEZ
# Repository: https://github.com/DevXoje/gerocultores-system
# =============================================================================

set -e

# Threshold: abort if more than this many files are deleted in one commit
MAX_DELETIONS=15

# Count staged deletions (D = deleted in git diff --cached --name-status)
DELETED_COUNT=$(git diff --cached --name-status | grep -c "^D" || true)

if [ "$DELETED_COUNT" -gt "$MAX_DELETIONS" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║          COMMIT ABORTED — MASS DELETION DETECTED            ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                                                              ║"
  echo "║  You are about to delete ${DELETED_COUNT} files in a single commit.      ║"
  echo "║  The policy for this repository limits deletions to         ║"
  echo "║  ${MAX_DELETIONS} files per commit to prevent accidental data loss.     ║"
  echo "║                                                              ║"
  echo "║  What to do instead:                                        ║"
  echo "║  1. Create a dedicated branch for this deletion             ║"
  echo "║  2. Push the branch to origin                               ║"
  echo "║  3. Open a Pull Request with a clear justification          ║"
  echo "║  4. Get a review and approval before merging                ║"
  echo "║                                                              ║"
  echo "║  If the deletion is intentional and approved via PR:        ║"
  echo "║    git commit --no-verify -m 'chore: ... (PR #XX)'         ║"
  echo "║                                                              ║"
  echo "║  See CONTRIBUTING.md for the full Mass-Deletion Guardrail.  ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi

# Also check for deletion of top-level critical directories
# AGENTS/ is included because it contains guardrail and role definitions
CRITICAL_DIRS="AGENTS DECISIONS SPEC OUTPUTS PLAN"

for DIR in $CRITICAL_DIRS; do
  CRITICAL_DELETIONS=$(git diff --cached --name-status | grep "^D" | grep "^D\s*${DIR}/" | wc -l | tr -d ' ')
  if [ "$CRITICAL_DELETIONS" -gt 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║       COMMIT ABORTED — CRITICAL DIRECTORY DELETION          ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║                                                              ║"
    echo "║  You are deleting files from the critical directory:        ║"
    echo "║    ${DIR}/                                                   ║"
    echo "║                                                              ║"
    echo "║  This directory contains SDD artifacts (specs, decisions,   ║"
    echo "║  outputs, plans) that must not be deleted without an ADR    ║"
    echo "║  and explicit approval via Pull Request.                    ║"
    echo "║                                                              ║"
    echo "║  If this deletion is approved, use:                         ║"
    echo "║    git commit --no-verify -m 'chore: ... (ADR-XX, PR #XX)' ║"
    echo "║                                                              ║"
    echo "║  See CONTRIBUTING.md for the full policy.                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
  fi
done

# All checks passed
exit 0
