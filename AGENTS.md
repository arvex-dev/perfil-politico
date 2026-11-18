<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deploy

- Deploy only when the owner asks: `git tag deploy-$(date -u +%Y%m%d-%H%M) && git push origin <tag>`. The `deploy-*` tag runs
  `.github/workflows/ci.yml` (verify, then the Deploy job: `arvex ship-image` over SSH). Never deploy on your own.
- The workflow has no branch push or pull_request trigger (Actions quota): run the checks locally before pushing.
  `workflow_dispatch` runs only the verify job.
- Laptop deploy (``pnpm ship``, Node 24, needs the admin SSH key and a GitHub Packages token in `~/.npmrc`) is a fallback, only if Actions is unavailable.
- The Caddy site file (`arvex edge site`) is a one-off setup step, not part of routine deploys.
- The repo is public: `arvex.config.json` and `deploy/known_hosts` are gitignored. CI rebuilds them from `arvex.config.example.json` and the secrets `ARVEX_HOST` and `DEPLOY_KNOWN_HOSTS`.
