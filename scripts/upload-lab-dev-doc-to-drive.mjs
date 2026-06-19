/**
 * Upload Lab dev tech doc to Google Drive as Google Doc.
 * Usage: node scripts/upload-lab-dev-doc-to-drive.mjs [markdown-path]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const projectFolderId = "1xno61id18Gvg8t87okwmF9JOAsTVbSH3";
const targetFolderName = "Three.js 참조";
const parentFolderName = "레퍼런스 사이트";
const docTitle = "Lab-01-Hiroto-Sato-개발기술문서";

const oauthPath = path.join(
  process.env.APPDATA,
  "mcp-server-google-drive",
  "oauth-credentials.json",
);
const tokenPath = path.join(
  process.env.APPDATA,
  "mcp-server-google-drive",
  "tokens.json",
);

const oauth = JSON.parse(fs.readFileSync(oauthPath, "utf8"));
let tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

async function refreshAccessToken() {
  const body = new URLSearchParams({
    client_id: oauth.installed.client_id,
    client_secret: oauth.installed.client_secret,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  const res = await fetch(oauth.installed.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);

  tokens = {
    ...tokens,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  return tokens.access_token;
}

async function getAccessToken() {
  if (tokens.expiry_date && Date.now() < tokens.expiry_date - 60_000) {
    return tokens.access_token;
  }
  return refreshAccessToken();
}

async function driveRequest(url, options = {}) {
  const accessToken = await getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function findFolder(name, parentId) {
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const found = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
  );
  return found.files?.[0] ?? null;
}

async function findExistingDoc(name, folderId) {
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
  );
  const found = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
  );
  return found.files?.[0] ?? null;
}

function markdownToPlainText(md) {
  return md
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^---$/gm, "────────────────")
    .replace(/\|/g, " ")
    .trim();
}

async function createGoogleDoc(title, folderId, markdownContent) {
  const existing = await findExistingDoc(title, folderId);
  const plainText = markdownToPlainText(markdownContent);

  if (existing) {
    // Clear and rewrite via Docs API
    const doc = await driveRequest(
      `https://docs.googleapis.com/v1/documents/${existing.id}`,
    );
    const endIndex = doc.body.content.at(-1).endIndex - 1;
    if (endIndex > 1) {
      await driveRequest(
        `https://docs.googleapis.com/v1/documents/${existing.id}:batchUpdate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{ deleteContentRange: { range: { startIndex: 1, endIndex } } }],
          }),
        },
      );
    }
    await driveRequest(
      `https://docs.googleapis.com/v1/documents/${existing.id}:batchUpdate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{ insertText: { location: { index: 1 }, text: plainText } }],
        }),
      },
    );
    const meta = await driveRequest(
      `https://www.googleapis.com/drive/v3/files/${existing.id}?fields=id,name,webViewLink`,
    );
    return { ...meta, updated: true };
  }

  const created = await driveRequest(
    "https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: title,
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
      }),
    },
  );

  await driveRequest(
    `https://docs.googleapis.com/v1/documents/${created.id}:batchUpdate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ insertText: { location: { index: 1 }, text: plainText } }],
      }),
    },
  );

  return { ...created, updated: false };
}

const mdPath =
  process.argv[2] ??
  path.join(projectRoot, "docs/lab/Lab-01-Hiroto-Sato-개발기술문서.md");

if (!fs.existsSync(mdPath)) {
  console.error(`File not found: ${mdPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(mdPath, "utf8");

console.log("Refreshing token if needed...");
await getAccessToken();

const refSites = await findFolder(parentFolderName, projectFolderId);
if (!refSites) throw new Error(`Folder not found: ${parentFolderName}`);

const threeJsFolder = await findFolder(targetFolderName, refSites.id);
if (!threeJsFolder) throw new Error(`Folder not found: ${targetFolderName}`);

console.log(`Target folder: ${threeJsFolder.name}`);
console.log(`Link: ${threeJsFolder.webViewLink}`);

const result = await createGoogleDoc(docTitle, threeJsFolder.id, markdown);

console.log(`\n${result.updated ? "Updated" : "Created"}: ${result.name}`);
console.log(`Doc link: ${result.webViewLink ?? `https://docs.google.com/document/d/${result.id}/edit`}`);
console.log("\nDone.");
