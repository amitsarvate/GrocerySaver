#!/usr/bin/env bash
set -euo pipefail

# Bootstraps:
# - GitHub repo (optional)
# - milestones from `ISSUES.md`
# - issues from `ISSUES.md`
#
# Requirements:
# - `gh` installed and authenticated (`gh auth login`)
# - `git` repo present (this script can create the GitHub repo, but not `git init`)
#
# Usage:
#   REPO_NAME=GrocerySaver VISIBILITY=private ./scripts/github_bootstrap.sh
#   REPO=owner/name ./scripts/github_bootstrap.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ISSUES_FILE="${ROOT_DIR}/ISSUES.md"

REPO_NAME="${REPO_NAME:-GrocerySaver}"
VISIBILITY="${VISIBILITY:-private}" # private|public|internal (internal requires org)
REPO="${REPO:-}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }
}

require_cmd gh
require_cmd git

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 1
fi

if [[ ! -f "${ISSUES_FILE}" ]]; then
  echo "Missing ${ISSUES_FILE}" >&2
  exit 1
fi

cd "${ROOT_DIR}"

# If REPO isn't provided, try to infer from existing remote.
if [[ -z "${REPO}" ]]; then
  if git remote get-url origin >/dev/null 2>&1; then
    # Works for both HTTPS and SSH URLs.
    ORIGIN_URL="$(git remote get-url origin)"
    REPO="$(echo "${ORIGIN_URL}" | sed -E 's#^(git@github.com:|https://github.com/)##' | sed -E 's#\.git$##')"
  fi
fi

# Create repo if we still don't have one.
if [[ -z "${REPO}" ]]; then
  echo "No GitHub repo detected; creating ${REPO_NAME} (${VISIBILITY}) and pushing current branch..."
  gh repo create "${REPO_NAME}" "--${VISIBILITY}" --source=. --remote=origin --push --confirm
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
fi

echo "Using repo: ${REPO}"

milestone_exists() {
  local title="$1"
  gh api -H "Accept: application/vnd.github+json" "repos/${REPO}/milestones?state=all&per_page=100" \
    --jq ".[] | select(.title==\"${title}\") | .number" >/dev/null
}

ensure_milestone() {
  local title="$1"
  if milestone_exists "${title}"; then
    return 0
  fi
  gh api -H "Accept: application/vnd.github+json" -X POST "repos/${REPO}/milestones" -f "title=${title}" >/dev/null
}

issue_exists() {
  local title="$1"
  gh issue list -R "${REPO}" --search "in:title \"${title}\"" --json title --jq ".[] | select(.title==\"${title}\") | .title" \
    | grep -q "^${title}$"
}

create_issue() {
  local milestone="$1"
  local title="$2"
  local body="$3"

  if issue_exists "${title}"; then
    echo "Issue exists, skipping: ${title}"
    return 0
  fi

  gh issue create -R "${REPO}" --title "${title}" --body "${body}" --milestone "${milestone}" >/dev/null
  echo "Created issue: ${title}"
}

# Parse ISSUES.md into (milestone, title, body).
current_milestone=""
current_title=""
current_body=""

flush_issue() {
  if [[ -n "${current_milestone}" && -n "${current_title}" ]]; then
    ensure_milestone "${current_milestone}"
    create_issue "${current_milestone}" "${current_title}" "${current_body}"
  fi
  current_title=""
  current_body=""
}

while IFS='' read -r line || [[ -n "${line}" ]]; do
  if [[ "${line}" =~ ^##\ Milestone:\ (.+)$ ]]; then
    flush_issue
    current_milestone="${BASH_REMATCH[1]}"
    continue
  fi

  if [[ "${line}" =~ ^-\ \[\ \]\ (.+)$ ]]; then
    flush_issue
    current_title="${BASH_REMATCH[1]}"
    current_body="Milestone: ${current_milestone}\n\n${line}"
    continue
  fi

  if [[ -n "${current_title}" ]]; then
    current_body="${current_body}\n${line}"
  fi
done < "${ISSUES_FILE}"

flush_issue

echo "Done."

