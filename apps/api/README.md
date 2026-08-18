# api

Backend for the GitHub App connect flow. Exchanges the code GitHub sends back after
a user installs the app for an installation, and keeps track of installations.

## 1. Create the GitHub App

Go to https://github.com/settings/apps/new and configure:

- **GitHub App name**: anything unique, e.g. `my-code-agent-dev`. This becomes the
  slug used in `GITHUB_APP_SLUG` below (check the URL after creating it, e.g.
  `github.com/settings/apps/my-code-agent-dev`).
- **Homepage URL**: `http://localhost:3001` (fine for local dev).
- **Callback URL**: `http://localhost:3001/github/callback`
- **Request user authorization (OAuth) during installation**: check this box. This
  is what makes GitHub include a `code` alongside `installation_id` on the callback.
- **Webhook**: uncheck "Active" for now — not used by this flow.
- **Repository permissions**: at minimum
  - Contents: Read & write
  - Metadata: Read-only
  - Pull requests: Read & write
  (add more later as the agent needs them)
- **Where can this GitHub App be installed?**: "Only on this account" is fine to start.

After creating it:

1. Note the **App ID** and **Client ID** shown at the top of the app's settings page.
2. Click **Generate a new client secret** and copy it.
3. Scroll to **Private keys** and click **Generate a private key** — this downloads a
   `.pem` file.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
GITHUB_APP_ID=<App ID>
GITHUB_APP_CLIENT_ID=<Client ID>
GITHUB_APP_CLIENT_SECRET=<Client secret>
GITHUB_APP_PRIVATE_KEY_PATH=<path to the downloaded .pem file>
GITHUB_APP_SLUG=<the app's url slug>
```

For the private key, the easiest option is `GITHUB_APP_PRIVATE_KEY_PATH` —
point it straight at wherever the `.pem` GitHub downloaded landed (e.g.
`~/Downloads/my-code-agent-dev.2026-08-18.private-key.pem`), no copy-pasting
needed. If you'd rather inline it, set `GITHUB_APP_PRIVATE_KEY` instead with
the full PEM contents (`-----BEGIN/END RSA PRIVATE KEY-----` included);
replace real newlines with literal `\n` if your tooling collapses them.
`.env` is already gitignored at the repo root, and `*.pem` is too — but keep
the key file out of the repo regardless.

Also set `apps/web/.env.local` (see `apps/web/.env.example`) with
`NEXT_PUBLIC_GITHUB_APP_SLUG` matching `GITHUB_APP_SLUG` above.

## 3. Run it

From the repo root: `bun run dev` starts this alongside `web` and `docs`
(this app on port 3002 by default). Or just this workspace: `bun run dev`
from `apps/api`.

## Notes

- Installations are stored in an **in-memory Map** (`src/lib/store.ts`) — restarting
  this process forgets every connected installation. Replace with a real database
  before this needs to survive restarts or serve more than one developer.
- Installation access tokens (used to actually call the GitHub API as the app) are
  short-lived (1 hour) and minted on demand from the stored `installationId` — see
  `getInstallationAccessToken` in `src/lib/githubApp.ts`. Don't persist those tokens.
