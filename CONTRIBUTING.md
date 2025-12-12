# Contributing to zkTelos Wallet

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, track issues and feature requests, and accept pull requests.

## All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've changed or added functionality, update the documentation accordingly.
3. Ensure the test suite passes.
4. Make sure your code lints.
5. Open a Pull Request.

---

## Branch Strategy

We follow a Trunk-Based / GitHub Flow–style workflow:

- `main` — the only long-lived branch
  - Always reflects the latest integrated code
  - Continuously deployed to staging
  - Production releases are created by tagging commits on `main`

---

## Feature Development Process

### 1. Create a Feature Branch

All features and fixes start from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/short-description
```   

### 2. Develop and Commit

Guidelines:
- Keep changes focused and reviewable
- Prefer small PRs over large PRs
- Run tests and lint locally when possible
- Rebase frequently on `main` to reduce conflicts

```bash
git fetch origin
git rebase origin/main
```

### 3. Open a Pull Request

- Base branch: `main`
- PRs must be small and reviewable
- Link the related issue or ticket if applicable
- Include a short summary explaining what changed and why

### 4. Merge Strategy

- All PRs are merged using Squash and Merge
- Result: 1 PR = 1 commit on `main`
- Keeps history clean and makes reverts straightforward

Merging a PR into `main` automatically deploys the web app to staging.

---

## Release Process (Weekly)

Production releases are created from `main` using Git tags.

### High-Level Overview

1. Features are merged into `main` throughout the week
2. `main` is continuously deployed to staging
3. When staging is approved, a version tag is created on `main`
4. The tag triggers:
   - Web deployment to production
   - Desktop builds (macOS, Windows, Linux)
   - A GitHub Release Draft with installers attached

---

## Creating a New Release

### 1. Ensure `main` Is Ready

Prerequisites:
- All intended PRs are merged
- Staging has been validated
- CI checks are green

```bash
git checkout main
git pull origin main
```

### 2. Create and Push the Version Tag

Tags must be created on `main` and must be annotated.

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Example: v0.0.5

---

## What Happens Automatically After Pushing the Tag

When the tag is pushed, the following happens automatically:

1. Web Production Deployment
   - Builds and deploys the web app to the production S3 bucket
   - CloudFront cache is invalidated

2. Desktop Builds
   - macOS (ARM64 & x64)
   - Windows (x64)
   - Linux (.AppImage and .deb)

3. GitHub Release Draft
   - A draft release is created
   - Installers are uploaded as release assets

Note: CI artifacts have a limited retention period. Release assets attached to GitHub Releases remain available unless the release is deleted.

---

## Publish the Release

1. Go to GitHub Releases:
   https://github.com/protofire/telos-privacy-wallet/releases
2. Open the newly created draft release
3. Review the release notes and assets
4. Click "Publish release"

---

## Hotfix Process

Urgent fixes follow the same flow as normal changes, starting from `main`.

### 1. Create Hotfix Branch

```bash
git checkout main
git pull origin main
git checkout -b hotfix/short-description
```

### 2. Fix, PR, and Merge

- Open a PR targeting `main`
- Ensure CI passes
- Merge using Squash and Merge
- Staging updates automatically

### 3. Tag and Release

After validating the fix in staging, create and push a new tag:

```bash
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Hotfix vX.Y.Z"
git push origin vX.Y.Z
```

This triggers production deployment and a new GitHub Release Draft.

---

## Licensing

Any contributions you make will be licensed under the project's licenses:

- MIT License:
  https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_MIT
- Apache License 2.0:
  https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_APACHE

---

## Reporting Bugs

Please report bugs using GitHub Issues:
https://github.com/protofire/telos-privacy-wallet/issues

A good bug report includes:
- Expected behavior
- Actual behavior
- Steps to reproduce
- Logs or screenshots
- Environment details (OS, platform, Electron version, wallet version)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT and Apache-2.0 licenses.

