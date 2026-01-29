# OSS publishing

The `/oss` subtree is mirrored to a public repository via `scripts/publish-oss.sh`.

## Required secrets and variables

Private repo (this repo):
- **Secret**: `OSS_DEPLOY_KEY` — *private* deploy key with write access to the public OSS repo  
  (Settings → Secrets and variables → Actions → New repository secret)
- **Variable**: `OSS_REPO_SSH_URL` — SSH remote for the public OSS repo  
  Example: `git@github.com:sandeshtiwari/mydatacanvas-oss.git`

Public repo (`mydatacanvas-oss`):
- Settings → Deploy keys → Add deploy key  
  - Paste the **public** key  
  - Check **“Allow write access”**

### Helper script

Generate a deploy key locally (do not commit the files):

```bash
./scripts/generate-oss-deploy-key.sh
```

This prints the public key for the public repo and writes the private key to `.secrets/oss/oss_deploy_key`.

## Dry run

```bash
OSS_REPO_URL=git@github.com:org/mydatacanvas-oss.git ./scripts/publish-oss.sh --dry-run
# or
./scripts/publish-oss.sh --repo git@github.com:org/mydatacanvas-oss.git --dry-run
```

## Manual publish

```bash
OSS_REPO_URL=git@github.com:org/mydatacanvas-oss.git ./scripts/publish-oss.sh
# or
./scripts/publish-oss.sh --repo git@github.com:org/mydatacanvas-oss.git
```

## GitHub Actions

`Publish OSS Subtree` runs on push to `main` and uses `OSS_DEPLOY_KEY`.
If the secret is missing, the workflow will skip publishing with a clear log message.
