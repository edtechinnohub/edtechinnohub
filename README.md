# EdTech InnoHub website

A free-to-run website for edtechinnohub.org — built with [Astro](https://astro.build), styled with Tailwind,
editable through a browser-based CMS, and set up to automatically pull new books and resources from
Google Drive.

- **Cost:** $0/month (GitHub, Netlify, and Google Drive API are all free at this scale).
- **You edit content two ways:** (1) drop a PDF into a Drive folder and it appears on the site within
  ~30 minutes automatically, or (2) log into `/admin` on the live site and write directly.

---

## 1. Push this to GitHub

```bash
cd edtechinnohub
git init
git add .
git commit -m "Initial site"
gh repo create edtechinnohub --public --source=. --remote=origin --push
# or, without the GitHub CLI: create a repo on github.com, then:
# git remote add origin https://github.com/YOUR-USERNAME/edtechinnohub.git
# git branch -M main
# git push -u origin main
```

Then open `public/admin/config.yml` and replace `YOUR-GITHUB-USERNAME/edtechinnohub` with your real repo
path, commit, and push again.

## 2. Deploy on Netlify (free)

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Pick your GitHub repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Deploy. You'll get a `*.netlify.app` URL immediately.

Netlify auto-redeploys every time anything is pushed to `main` — including when the Drive sync bot pushes,
and when you publish through `/admin`.

## 3. Point edtechinnohub.org at Netlify (via Namecheap)

In Netlify: **Site settings → Domain management → Add a domain** → enter `edtechinnohub.org`.
Netlify will show you DNS records to add.

In Namecheap: **Domain List → Manage → Advanced DNS**, and either:

- **Easiest:** change your nameservers to Netlify's (Netlify will give you the exact values, usually
  `dns1.p0X.nsone.net` etc.) under **Domain → Nameservers → Custom DNS**, or
- **Keep Namecheap DNS:** add an `A` record for `@` pointing to Netlify's load balancer IP
  (`75.2.60.5`) and a `CNAME` for `www` pointing to your `*.netlify.app` address — Netlify's domain
  panel shows the exact current values to use.

DNS changes usually take a few minutes to a few hours to propagate. Netlify issues a free HTTPS
certificate automatically once it verifies the domain.

## 4. Turn on the CMS login (`/admin`)

Because the site is on Netlify with the repo on GitHub, Decap CMS's GitHub login works out of the box —
no separate OAuth app needed. Visit `https://www.edtechinnohub.org/admin`, sign in with GitHub, and
you'll see forms for Blog posts, Books, and Resources. Publishing a post there commits directly to your
repo and triggers a new deploy.

## 5. Turn on Google Drive auto-sync

Your Drive folders (already created):
- **EdTech InnoHub Website** — https://drive.google.com/drive/folders/17Dwjk45wGrHFA-aZBt81XFlFnkm0FWNC
- **Books** — `1x0NEly7L9D59T5ZIzKYsVWnUZTPjd4mU`
- **Resources** — `1SWDS1coyQQ7Rme-D5PbAzT-NcEZ1i0yu`
- **Blog Images** — `1Ajq5SOUZUHbuFZvPjiDebCa5RYaYx8aJ` (for now, add blog images via `/admin` instead —
  it's simpler for small image files; this folder is there if you'd rather manage them from Drive later.)

### a) Create a Google Cloud service account

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project (any name, e.g.
   "edtechinnohub-sync").
2. **APIs & Services → Library** → enable the **Google Drive API**.
3. **APIs & Services → Credentials → Create Credentials → Service account**. Name it anything, no roles
   needed, click through to finish.
4. Open the service account → **Keys → Add key → Create new key → JSON**. This downloads a `.json` file
   — keep it private, never commit it to GitHub.
5. Copy the `client_email` value out of that JSON file (looks like
   `something@your-project.iam.gserviceaccount.com`).

### b) Share your Drive folders with the service account

In Google Drive, right-click **Books** → Share → paste the service account's `client_email` → give it
**Viewer** access. Do the same for **Resources**. (This step is required — without it the sync script
sees zero files.)

### c) Add GitHub secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret name | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | The entire contents of the downloaded JSON key file, pasted as-is |
| `DRIVE_BOOKS_FOLDER_ID` | `1x0NEly7L9D59T5ZIzKYsVWnUZTPjd4mU` |
| `DRIVE_RESOURCES_FOLDER_ID` | `1SWDS1coyQQ7Rme-D5PbAzT-NcEZ1i0yu` |

### d) That's it

The workflow in `.github/workflows/sync-drive.yml` runs every 30 minutes, checks both folders, and
commits a new content file for any file it hasn't seen before — which triggers a Netlify redeploy
automatically. You can also trigger it manually any time from your repo's **Actions** tab → "Sync Drive
content" → **Run workflow**.

Each auto-synced entry gets a generic title/description pulled from the filename — edit it afterward
through `/admin` (find it under Books or Resources) to add a real description, author, or category.

Delete the two files named "Sample: Delete Me..." in `src/content/books/` and `src/content/resources/`
once you have real content synced or added.

---

## Local development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build to dist/
```

## Project structure

```
src/
  content/
    books/       ← one .md file per book (manual or Drive-synced)
    resources/   ← one .md file per resource
    blog/        ← one .md file per blog post
    config.ts    ← schema for all three collections
  components/    ← Header, Footer, BookCard, ResourceCard, BlogCard
  layouts/       ← BaseLayout.astro
  pages/         ← one file per route
public/
  admin/         ← Decap CMS (config.yml + index.html)
scripts/
  sync-drive.mjs ← the Drive auto-sync script
.github/workflows/
  sync-drive.yml ← runs the sync script on a schedule
```
