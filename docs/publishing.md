# OSS publishing

The `/oss` subtree is mirrored to a public repository via `scripts/publish-oss.sh`.

## Required secrets

- `OSS_REMOTE` / `OSS_REPO_URL` — Git remote URL for the public OSS repo (e.g. `git@github.com:org/mydatacanvas-oss.git`)
- `OSS_DEPLOY_KEY` — SSH deploy key with push access to the OSS repo

## Dry run

```bash
OSS_REMOTE=git@github.com:org/mydatacanvas-oss.git ./scripts/publish-oss.sh --dry-run
# or
./scripts/publish-oss.sh --repo git@github.com:org/mydatacanvas-oss.git --dry-run
```

## Manual publish

```bash
OSS_REMOTE=git@github.com:org/mydatacanvas-oss.git ./scripts/publish-oss.sh
# or
./scripts/publish-oss.sh --repo git@github.com:org/mydatacanvas-oss.git
```

## GitHub Actions

`Publish OSS Subtree` runs on push to `main` and uses `OSS_DEPLOY_KEY`.
