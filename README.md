# The 3D Rebar Company — website, BIM viewer & CMS

A reinforcement-engineering marketing site with a live, interactive IFC viewer, a
"Projects Viewer" (a simplified Trimble Connect-style model browser), a
Tekla/rebar knowledge-hub blog, and an admin console that lets non-technical
staff edit all of it — homepage copy, projects, blog posts and media — without
touching code.

## Stack

- **TanStack Start** (React 19, file-based routing, server functions) on **Vite**
- **three.js** + **web-ifc** for a from-scratch WebGL IFC viewer (orbit/pan/zoom,
  section box, category isolate, saved views — no third-party BIM SDK)
- **Bun** as package manager/runtime
- A small **JSON-file CMS**: no external database. Content lives in `data/*.json`
  and uploaded files live in `public/uploads/`, both created automatically on
  first run.

## Getting started

```sh
bun install
bun run dev       # http://localhost:8080
```

First visit seeds one sample project (built from the FOUNDATION.ifc /
FOUNDATION_DRAWING.pdf you supplied) and five sample blog posts, one per
category, so the site isn't empty.

### Admin console

Go to `/admin/login`. On the very first login attempt, an `admin` account is
created automatically with a random password, which is:

- written to `data/admin-credentials.txt` (delete this file once you've signed
  in — it's not needed again), and
- printed once to the server's console log.

From **Admin → Users & Settings** you can change that password and invite
additional **Editor** accounts (editors can manage content but not users).

What you can manage from the admin console:

- **Homepage Content** — the hero headline/subtext/CTAs and the "What 2D
  Doesn't Show" section copy
- **Projects Viewer** — create/edit projects; upload/replace each project's IFC
  model, PDF drawings, images, videos and notes
- **Blog** — write, edit, publish/unpublish and delete posts across the five
  required categories (Tekla Workflows, Rebar Detailing, Constructability,
  Custom Components, Learning Hub), with a cover-image upload
- **Media Library** — a single view across every IFC/PDF/image/video uploaded
  anywhere on the site (standalone uploads, plus everything attached to a
  project or post)

### Building for production

```sh
bun run build
bun run preview   # smoke-test the production build locally
```

`bun run build` produces `dist/server/server.js` — a plain Node server. Start
it in production with:

```sh
node dist/server/server.js
```

Set these environment variables in production:

| Variable | Purpose | Default |
| --- | --- | --- |
| `SESSION_SECRET` | Signs/encrypts admin session cookies. Set a random 32+ character string. | Auto-generated and persisted to `data/.session-secret` if unset — fine for a single server, but set it explicitly if you ever run more than one instance. |
| `CMS_DATA_DIR` | Where the JSON content files live | `<project>/data` |
| `CMS_UPLOADS_DIR` | Where uploaded IFC/PDF/image/video files live | `<project>/public/uploads` |
| `PORT` | Port the Node server listens on | set by your host, typically `3000` |

## Deployment — important

This CMS stores content as JSON files and uploads as plain files on disk. That
**requires a persistent filesystem**, so deploy to a normal Node host — a VPS,
a Docker container, Render, Railway, Fly.io, or similar. **Do not** deploy to
Cloudflare Workers or another static/edge target: those environments have no
writable, persistent disk, so admin edits and uploads would silently vanish
(or fail outright) between requests.

If you outgrow a single server (need horizontal scaling, or want the data
queryable), migrate `data/*.json` into a real database and `public/uploads/`
into object storage (S3, R2, etc.) — the server functions in `src/server/`
are the only place that would need to change; nothing in the UI depends on
the storage mechanism.

Back up the `data/` directory (and `public/uploads/`) — that's the entire
CMS database. There is no separate backend to restore from.

## A couple of things worth knowing before you go live

- **Logo and hero image are placeholders.** The original project referenced a
  logo file and a hero background photo hosted on Lovable's own CDN, which
  isn't reachable outside Lovable's editor. Rather than invent a new brand
  identity, this build ships a small inline SVG lockup (`src/components/site/Logo.tsx`)
  and an SVG rebar-cage hero graphic (`src/components/site/HeroGraphic.tsx`),
  both built from the site's existing arc motif so the look stays consistent.
  Swap in your real logo/photo assets in those two files (or point them at
  `<img>` tags) whenever you have the originals.
- **The sample project and sample blog posts are seed content**, generated
  from the files you supplied so the site isn't empty on first run. Edit or
  delete them from the admin console once you've added your own projects and
  posts.
- **First IFC model load is a few MB over the wire** (the model geometry
  itself, decoded client-side with `web-ifc` + `three.js`) — this is normal for
  a from-scratch BIM viewer and scales with model complexity; very large
  federated models may benefit from server-side geometry simplification later.

## Project structure

```
src/
  routes/            File-based routes (TanStack Router). admin.tsx is the
                      admin console's layout+auth guard; admin_.login.tsx and
                      the *_.$id.tsx files intentionally escape that layout
                      nesting (see file names) so they render standalone.
  server/             All server functions + the JSON "database":
    env.ts / db.ts     Paths, atomic JSON read/write, id/slug helpers
    auth.ts            Login/session/users (raw session code is isolated
                        behind createServerOnlyFn so it never reaches the
                        client bundle)
    content.ts          Homepage copy
    projects.ts          Projects Viewer content + file uploads
    blog.ts              Blog posts
    media.ts             Aggregated media library
    seed.ts               First-run sample content
  lib/ifc/            IFC parsing (loadIfcModel.ts) + saved-view presets
  components/site/
    ifc-viewer/IfcViewer.tsx   The BIM viewer itself
data/                 JSON content — created on first run, back this up
public/uploads/       Uploaded IFC/PDF/image/video files — created on first run
```
