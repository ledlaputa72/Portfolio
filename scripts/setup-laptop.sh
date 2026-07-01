#!/usr/bin/env bash
# AI Portfolio — Laptop one-shot setup (macOS / Linux)
# Usage:
#   ./scripts/setup-laptop.sh
#   ./scripts/setup-laptop.sh --credentials "$HOME/Downloads/client_secret_XXX.json"
#   ./scripts/setup-laptop.sh --start-dev
#   ./scripts/setup-laptop.sh --help

set -euo pipefail

REPO_URL="https://github.com/ledlaputa72/Portfolio.git"
BRANCH="claude/gracious-wozniak-g7ld41"
PROJECT_PATH=""
CREDENTIALS_PATH=""
SKIP_CLONE=0
SKIP_INSTALL=0
SKIP_MCP=0
SKIP_AUTH=0
START_DEV=0

CONFIG_DIR="${HOME}/Library/Application Support/mcp-server-google-drive"
OAUTH_FILE="${CONFIG_DIR}/oauth-credentials.json"
TOKEN_FILE="${CONFIG_DIR}/tokens.json"

step() { echo ""; echo "==> $*"; }
ok()   { echo "    OK  $*"; }
warn() { echo "    !!  $*"; }
fail() { echo "    XX  $*"; exit 1; }

usage() {
  cat <<'EOF'

AI Portfolio — Laptop Setup Script (macOS)

Usage:
  ./scripts/setup-laptop.sh [options]

Options:
  --project-path <path>     Project folder (default: repo root)
  --credentials <path>      OAuth client JSON from Google Cloud Console
  --skip-clone              Skip git fetch/pull/checkout
  --skip-install            Skip npm install
  --skip-mcp                Skip Google Drive MCP setup
  --skip-auth               Skip OAuth browser auth
  --start-dev               Run npm run dev after setup
  --help                    Show this help

Examples:
  ./scripts/setup-laptop.sh
  ./scripts/setup-laptop.sh --credentials "$HOME/Downloads/client_secret_XXX.json"
  ./scripts/setup-laptop.sh --start-dev

EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-path) PROJECT_PATH="$2"; shift 2 ;;
    --credentials)  CREDENTIALS_PATH="$2"; shift 2 ;;
    --skip-clone)   SKIP_CLONE=1; shift ;;
    --skip-install) SKIP_INSTALL=1; shift ;;
    --skip-mcp)     SKIP_MCP=1; shift ;;
    --skip-auth)    SKIP_AUTH=1; shift ;;
    --start-dev)    START_DEV=1; shift ;;
    --help|-h)      usage; exit 0 ;;
    *) fail "Unknown option: $1 (use --help)" ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -z "$PROJECT_PATH" ]]; then
  PROJECT_PATH="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

echo ""
echo "========================================"
echo "  AI Portfolio — Laptop Setup (macOS)"
echo "========================================"

step "Checking prerequisites"
for cmd in git node npm npx; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd not found. Install it and restart the terminal."
  ok "$cmd $($cmd --version 2>/dev/null | head -1)"
done

node_major="$(node --version | sed 's/^v//' | cut -d. -f1)"
if [[ "$node_major" -lt 20 ]]; then
  warn "Node.js 20+ recommended (current: v${node_major})"
fi

ok "Project path: $PROJECT_PATH"

if [[ "$SKIP_CLONE" -eq 0 ]]; then
  step "Syncing Git repository"
  if [[ ! -d "${PROJECT_PATH}/.git" ]]; then
    warn "Not a git repo. Cloning into: $PROJECT_PATH"
    parent="$(dirname "$PROJECT_PATH")"
    name="$(basename "$PROJECT_PATH")"
    mkdir -p "$parent"
    git clone "$REPO_URL" "${parent}/${name}"
  fi
  cd "$PROJECT_PATH"
  git fetch origin
  git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" "origin/${BRANCH}"
  git pull origin "$BRANCH"
  ok "Branch: $BRANCH (up to date)"
fi

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  step "Installing npm dependencies"
  cd "$PROJECT_PATH"
  npm install
  ok "npm install complete"
fi

update_mcp_json() {
  local root="$1"
  local cursor_dir="${root}/.cursor"
  local mcp_file="${cursor_dir}/mcp.json"
  mkdir -p "$cursor_dir"
  cat > "$mcp_file" <<EOF
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@ibarcarty/mcp-server-google-drive"],
      "env": {
        "GDRIVE_MCP_OAUTH_PATH": "${OAUTH_FILE}",
        "GDRIVE_MCP_TOKEN_PATH": "${TOKEN_FILE}"
      }
    }
  }
}
EOF
  ok "Updated .cursor/mcp.json for user '$(whoami)'"
  echo "       OAuth: ${OAUTH_FILE}"
  echo "       Token: ${TOKEN_FILE}"
}

if [[ "$SKIP_MCP" -eq 0 ]]; then
  step "Setting up Google Drive MCP"
  mkdir -p "$CONFIG_DIR"

  if [[ -n "$CREDENTIALS_PATH" ]]; then
    [[ -f "$CREDENTIALS_PATH" ]] || fail "Credentials file not found: $CREDENTIALS_PATH"
    cp "$CREDENTIALS_PATH" "$OAUTH_FILE"
    ok "OAuth credentials copied"
  fi

  update_mcp_json "$PROJECT_PATH"

  if [[ ! -f "$OAUTH_FILE" ]]; then
    warn "OAuth credentials missing at: $OAUTH_FILE"
    echo "       Copy oauth-credentials.json from desktop, or run:"
    echo '       ./scripts/setup-laptop.sh --credentials "$HOME/Downloads/client_secret_XXX.json"'
  fi

  if [[ "$SKIP_AUTH" -eq 0 && -f "$OAUTH_FILE" && ! -f "$TOKEN_FILE" ]]; then
    step "Starting Google OAuth (browser will open)"
    export GDRIVE_MCP_OAUTH_PATH="$OAUTH_FILE"
    export GDRIVE_MCP_TOKEN_PATH="$TOKEN_FILE"
    if npx -y @ibarcarty/mcp-server-google-drive auth; then
      ok "OAuth tokens saved"
    else
      warn "OAuth auth did not complete. Run manually later:"
      echo "       npx @ibarcarty/mcp-server-google-drive auth"
    fi
  elif [[ -f "$TOKEN_FILE" ]]; then
    ok "OAuth tokens already exist"
  fi
fi

step "Setup summary"
echo "  Project:     $PROJECT_PATH"
echo "  Branch:      $BRANCH"
echo "  OAuth creds: $(if [[ -f "$OAUTH_FILE" ]]; then echo OK; else echo MISSING; fi)"
echo "  OAuth token: $(if [[ -f "$TOKEN_FILE" ]]; then echo OK; else echo MISSING; fi)"
echo "  MCP config:  ${PROJECT_PATH}/.cursor/mcp.json"

echo ""
echo "Next steps:"
echo "  1. Open Cursor -> File -> Open Folder -> $PROJECT_PATH"
echo "  2. Settings -> Tools & MCP -> google-drive ON -> Connected"
echo "  3. npm run dev  ->  http://localhost:3000"
echo "  4. Before work: git pull origin $BRANCH"
echo "  5. After work:  git push origin $BRANCH"
echo ""
echo "Guide: docs/Laptop-Setup-Guide.md"

if [[ "$START_DEV" -eq 1 ]]; then
  step "Starting dev server (Ctrl+C to stop)"
  cd "$PROJECT_PATH"
  npm run dev
fi
