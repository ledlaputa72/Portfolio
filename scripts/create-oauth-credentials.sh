#!/usr/bin/env bash
# Build oauth-credentials.json when GCP JSON download is unavailable.
# Usage:
#   ./scripts/create-oauth-credentials.sh
#   ./scripts/create-oauth-credentials.sh --client-id "xxx.apps.googleusercontent.com" --client-secret "GOCSPX-xxx"

set -euo pipefail

CONFIG_DIR="${HOME}/Library/Application Support/mcp-server-google-drive"
OUT_FILE="${CONFIG_DIR}/oauth-credentials.json"
CLIENT_ID=""
CLIENT_SECRET=""
PROJECT_ID="ai-portfolio"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --client-id)     CLIENT_ID="$2"; shift 2 ;;
    --client-secret) CLIENT_SECRET="$2"; shift 2 ;;
    --project-id)    PROJECT_ID="$2"; shift 2 ;;
    --help|-h)
      cat <<'EOF'
Usage:
  ./scripts/create-oauth-credentials.sh
  ./scripts/create-oauth-credentials.sh --client-id "ID" --client-secret "GOCSPX-..."

Creates ~/Library/Application Support/mcp-server-google-drive/oauth-credentials.json
EOF
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ -z "$CLIENT_ID" ]]; then
  echo "Client ID (화면에 표시된 값, ...apps.googleusercontent.com):"
  read -r CLIENT_ID
fi

if [[ -z "$CLIENT_SECRET" ]]; then
  echo "Client Secret (+ 보안 비밀번호 추가 후 한 번만 표시되는 GOCSPX-... 값):"
  read -rs CLIENT_SECRET
  echo ""
fi

[[ -n "$CLIENT_ID" && -n "$CLIENT_SECRET" ]] || { echo "Client ID와 Secret이 필요합니다."; exit 1; }

mkdir -p "$CONFIG_DIR"

cat > "$OUT_FILE" <<EOF
{
  "installed": {
    "client_id": "${CLIENT_ID}",
    "project_id": "${PROJECT_ID}",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "${CLIENT_SECRET}",
    "redirect_uris": ["http://localhost"]
  }
}
EOF

chmod 600 "$OUT_FILE"
echo "OK  Created: $OUT_FILE"
echo ""
echo "Next:"
echo "  ./scripts/setup-laptop.sh --skip-clone --skip-install --skip-mcp"
echo "  export GDRIVE_MCP_OAUTH_PATH=\"$OUT_FILE\""
echo "  export GDRIVE_MCP_TOKEN_PATH=\"${CONFIG_DIR}/tokens.json\""
echo "  npx @ibarcarty/mcp-server-google-drive auth"
