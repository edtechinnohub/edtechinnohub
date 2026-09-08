/**
 * Syncs new files dropped into the "EdTech InnoHub Website" Drive folders
 * (Books, Resources) into Astro content entries.
 *
 * Runs on a schedule via .github/workflows/sync-drive.yml. It never deletes
 * or overwrites content you've edited by hand — it only adds an entry for
 * files it hasn't seen before (tracked by Drive file ID).
 *
 * Required environment variables (set as GitHub Actions secrets):
 *   GOOGLE_SERVICE_ACCOUNT_KEY  - full JSON key for a Google service account,
 *                                 as a single-line string.
 *   DRIVE_BOOKS_FOLDER_ID       - Drive folder ID for Books.
 *   DRIVE_RESOURCES_FOLDER_ID   - Drive folder ID for Resources.
 *
 * IMPORTANT SETUP STEP: share both Drive folders with the service account's
 * email address (found in the JSON key as "client_email") as at least
 * "Viewer". Without this, the script will see zero files.
 */

import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BOOKS_DIR = path.join(ROOT, 'src/content/books');
const RESOURCES_DIR = path.join(ROOT, 'src/content/resources');

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return val;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '') // strip file extension
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function toYamlString(str) {
  return `"${String(str).replace(/"/g, '\\"')}"`;
}

/** Returns a Set of Drive file IDs already represented in a content dir. */
function existingDriveIds(dir) {
  const ids = new Set();
  if (!fs.existsSync(dir)) return ids;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const match = content.match(/driveFileId:\s*"?([\w-]+)"?/);
    if (match) ids.add(match[1]);
  }
  return ids;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function listFolderFiles(drive, folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name, createdTime, webViewLink, mimeType)',
    pageSize: 200,
  });
  return res.data.files ?? [];
}

function writeBookEntry(file) {
  const slug = slugify(file.name);
  const filePath = path.join(BOOKS_DIR, `${slug}.md`);
  const title = file.name.replace(/\.[a-z0-9]+$/i, '');
  const frontmatter = `---
title: ${toYamlString(title)}
description: ${toYamlString('Added from the EdTech InnoHub Drive library. Edit this description in the CMS or in this file.')}
fileUrl: ${toYamlString(file.webViewLink)}
publishDate: ${file.createdTime.slice(0, 10)}
driveFileId: ${toYamlString(file.id)}
driveSynced: true
---

Added automatically from Drive. Feel free to replace this text with a real description.
`;
  fs.writeFileSync(filePath, frontmatter, 'utf-8');
  console.log(`+ book: ${filePath}`);
}

function writeResourceEntry(file) {
  const slug = slugify(file.name);
  const filePath = path.join(RESOURCES_DIR, `${slug}.md`);
  const title = file.name.replace(/\.[a-z0-9]+$/i, '');
  const frontmatter = `---
title: ${toYamlString(title)}
category: "Other"
description: ${toYamlString('Added from the EdTech InnoHub Drive library. Edit this description and category in the CMS or in this file.')}
fileUrl: ${toYamlString(file.webViewLink)}
publishDate: ${file.createdTime.slice(0, 10)}
driveFileId: ${toYamlString(file.id)}
driveSynced: true
---

Added automatically from Drive. Feel free to replace this text with a real description.
`;
  fs.writeFileSync(filePath, frontmatter, 'utf-8');
  console.log(`+ resource: ${filePath}`);
}

async function main() {
  const keyJson = requireEnv('GOOGLE_SERVICE_ACCOUNT_KEY');
  const booksFolderId = requireEnv('DRIVE_BOOKS_FOLDER_ID');
  const resourcesFolderId = requireEnv('DRIVE_RESOURCES_FOLDER_ID');

  const credentials = JSON.parse(keyJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth });

  ensureDir(BOOKS_DIR);
  ensureDir(RESOURCES_DIR);

  const knownBookIds = existingDriveIds(BOOKS_DIR);
  const knownResourceIds = existingDriveIds(RESOURCES_DIR);

  const [bookFiles, resourceFiles] = await Promise.all([
    listFolderFiles(drive, booksFolderId),
    listFolderFiles(drive, resourcesFolderId),
  ]);

  let added = 0;
  for (const file of bookFiles) {
    if (knownBookIds.has(file.id)) continue;
    writeBookEntry(file);
    added++;
  }
  for (const file of resourceFiles) {
    if (knownResourceIds.has(file.id)) continue;
    writeResourceEntry(file);
    added++;
  }

  console.log(added > 0 ? `Synced ${added} new file(s) from Drive.` : 'No new files found in Drive.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
