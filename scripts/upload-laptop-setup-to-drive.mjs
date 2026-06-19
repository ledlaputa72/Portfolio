/**
 * Upload laptop setup docs to Google Drive project folder.
 * Usage: node scripts/upload-laptop-setup-to-drive.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const parentFolderId = "1xno61id18Gvg8t87okwmF9JOAsTVbSH3";
const driveFolderName = "Cursor-랩탑-세팅-가이드";

const tokenPath = path.join(
  process.env.APPDATA,
  "mcp-server-google-drive",
  "tokens.json",
);
const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

async function driveRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function findOrCreateFolder(name, parentId) {
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const found = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`,
  );
  if (found.files?.[0]) return found.files[0];

  return driveRequest("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
}

async function uploadFile(localPath, folderId) {
  const fileName = path.basename(localPath);
  const q = encodeURIComponent(
    `name='${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
  );
  const existing = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`,
  );

  const mimeTypes = {
    ".md": "text/markdown",
    ".ps1": "text/plain",
    ".bat": "text/plain",
    ".html": "text/html",
  };
  const ext = path.extname(localPath).toLowerCase();
  const mimeType = mimeTypes[ext] ?? "application/octet-stream";
  const content = fs.readFileSync(localPath);

  const metadata = {
    name: fileName,
    mimeType,
    ...(existing.files?.[0] ? {} : { parents: [folderId] }),
  };

  const boundary = "-------drive-upload-boundary";
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`),
    Buffer.from(JSON.stringify(metadata)),
    Buffer.from(`\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const url = existing.files?.[0]
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing.files[0].id}?uploadType=multipart&fields=id,name,webViewLink`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink";

  const method = existing.files?.[0] ? "PATCH" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

const filesToUpload = [
  "docs/Laptop-Setup-Guide.md",
  "scripts/setup-laptop.ps1",
  "scripts/setup-laptop.bat",
  "docs/Google-Drive-MCP-Setup.md",
  "docs/AI-Tools-Workflow.md",
];

const folder = await findOrCreateFolder(driveFolderName, parentFolderId);
console.log(`Folder: ${folder.name}`);
console.log(`Link:   ${folder.webViewLink ?? `https://drive.google.com/drive/folders/${folder.id}`}`);

for (const rel of filesToUpload) {
  const localPath = path.join(projectRoot, rel);
  if (!fs.existsSync(localPath)) {
    console.warn(`Skip (missing): ${rel}`);
    continue;
  }
  const uploaded = await uploadFile(localPath, folder.id);
  console.log(`Uploaded: ${uploaded.name}`);
}

console.log("\nDone.");
