/**
 * Sync Lab planning docs to Google Drive.
 * Usage:
 *   node scripts/sync-lab-planning-to-drive.mjs --labs 1,4,5,6,31,3,10
 *   node scripts/sync-lab-planning-to-drive.mjs --file docs/lab/Lab-Reference-Audit-Checklist.md --title Lab-Reference-Audit-Checklist
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generatePlanningDoc, labSitesForSync } from "./lib/lab-planning-doc.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const projectFolderId = "1xno61id18Gvg8t87okwmF9JOAsTVbSH3";
const parentFolderName = "레퍼런스 사이트";
const targetFolderName = "Three.js 참조";

const oauthPath = path.join(process.env.APPDATA, "mcp-server-google-drive", "oauth-credentials.json");
const tokenPath = path.join(process.env.APPDATA, "mcp-server-google-drive", "tokens.json");
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
  if (!res.ok) throw new Error(JSON.stringify(data));
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
    headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers ?? {}) },
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

async function upsertGoogleDoc(title, folderId, plainText) {
  const q = encodeURIComponent(
    `name='${title.replace(/'/g, "\\'")}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
  );
  const existing = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
  );

  let docId = existing.files?.[0]?.id;

  if (!docId) {
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
    docId = created.id;
  } else {
    const doc = await driveRequest(`https://docs.googleapis.com/v1/documents/${docId}`);
    const endIndex = doc.body.content.at(-1).endIndex - 1;
    if (endIndex > 1) {
      await driveRequest(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{ deleteContentRange: { range: { startIndex: 1, endIndex } } }],
        }),
      });
    }
  }

  await driveRequest(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ insertText: { location: { index: 1 }, text: plainText } }],
    }),
  });

  const meta = await driveRequest(
    `https://www.googleapis.com/drive/v3/files/${docId}?fields=id,name,webViewLink`,
  );
  return meta;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { labs: [], file: null, title: null, all: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--labs" && args[i + 1]) {
      opts.labs = args[++i].split(",").map((n) => parseInt(n.trim(), 10));
    } else if (args[i] === "--file" && args[i + 1]) {
      opts.file = args[++i];
    } else if (args[i] === "--title" && args[i + 1]) {
      opts.title = args[++i];
    } else if (args[i] === "--all") {
      opts.all = true;
    }
  }
  return opts;
}

const opts = parseArgs();
await getAccessToken();

const refSites = await findFolder(parentFolderName, projectFolderId);
if (!refSites) throw new Error(`Folder not found: ${parentFolderName}`);
const threeJsFolder = await findFolder(targetFolderName, refSites.id);
if (!threeJsFolder) throw new Error(`Folder not found: ${targetFolderName}`);

console.log(`Target: ${threeJsFolder.webViewLink}\n`);

if (opts.file) {
  const filePath = path.isAbsolute(opts.file) ? opts.file : path.join(projectRoot, opts.file);
  const title = opts.title ?? path.basename(filePath, path.extname(filePath));
  const text = fs.readFileSync(filePath, "utf8");
  const result = await upsertGoogleDoc(title, threeJsFolder.id, text);
  console.log(`Updated: ${result.name}`);
  console.log(result.webViewLink);
  process.exit(0);
}

const sites = opts.all
  ? labSitesForSync
  : labSitesForSync.filter((s) => opts.labs.includes(s.num));

if (sites.length === 0) {
  console.error("No labs selected. Use --labs 1,4,5 or --all");
  process.exit(1);
}

for (const site of sites) {
  const num = String(site.num).padStart(2, "0");
  const title = `Lab-${num}-${site.fileSlug}-기획`;
  const text = generatePlanningDoc(site, site.num);
  const localPath = path.join(projectRoot, "docs/lab/planning", `${title}.txt`);
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, text, "utf8");
  const result = await upsertGoogleDoc(title, threeJsFolder.id, text);
  console.log(`✓ ${title}`);
  console.log(`  ${result.webViewLink}`);
}

console.log("\nDone.");
