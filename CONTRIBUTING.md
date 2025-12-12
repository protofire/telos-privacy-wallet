# Contributing to zkTelos Wallet

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github
We use Github to host code, to track issues and feature requests, as well as accept pull requests.

## All Code Changes Happen Through Pull Requests
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've changed/added any features, update the documentation accordingly.
3. Ensure the test suite passes.
4. Make sure your code lints.
5. Issue that pull request!

## Release Process

We follow a structured release process to ensure smooth deployments:

### Branch Strategy
- `dev` - Development branch where all features are merged
- `main` - Production branch, always reflects the latest release

### Creating a New Release

#### 1. Prepare the Release in `dev`

```bash
# Make sure you're on dev and it's up to date
git checkout dev
git pull origin dev

# Update version in package.json
# Edit apps/zktelos-wallet/package.json and bump the version (e.g., 0.0.4 -> 0.0.5)

# Update CHANGELOG.md
# Add a new section at the top with the new version and all changes
# Follow the Keep a Changelog format with sections: Added, Changed, Fixed, Removed

# Commit the changes
git add CHANGELOG.md apps/zktelos-wallet/package.json
git commit -m "Prepare release X.X.X"
git push origin dev
```

#### 2. Merge main into dev (Resolve Conflicts)

```bash
# Merge main into dev to get any hotfixes or changes
git merge -X ours origin/main

# If there are conflicts, resolve them keeping dev changes
# After resolving conflicts:
git add .
git commit -m "Merge main into dev (resolve conflicts)"
git push origin dev
```

#### 3. Create Pull Request

- Create a PR from `dev` to `main` on GitHub
- Title: "Release vX.X.X"
- Wait for CI/CD checks to pass
- Get approval if required

#### 4. Merge the Pull Request

- Use "Squash and merge" or "Merge" (keep all commits)
- The workflows will run on `main` but **will NOT create a release draft** yet

#### 5. Create and Push the Version Tag

**IMPORTANT**: The tag must be created **AFTER** the merge to `main`, not before.

```bash
# Switch to main and update
git checkout main
git pull origin main

# Create an annotated tag
git tag -a vX.X.X -m "Release version X.X.X

### Added
- Feature 1
- Feature 2

### Changed
- Change 1

### Fixed
- Fix 1"

# Push the tag to trigger the release workflow
git push origin vX.X.X
```

#### 6. Automatic Build and Release

When you push the tag, the following happens automatically:

1. **Build Workflow** (`build-electron-native.yml`) is triggered
2. Builds are generated for:
   - macOS (ARM64 and x64)
   - Windows (x64)
   - Linux (AppImage and .deb)
3. A **Release Draft** is automatically created on GitHub with all installers attached
4. **Web Deployment** (`deploy-web-s3.yml`) deploys to S3 and invalidates CloudFront cache

#### 7. Publish the Release

1. Go to [GitHub Releases](https://github.com/protofire/telos-privacy-wallet/releases)
2. Find the draft release created automatically
3. Review the release notes and assets
4. Click "Publish release"

### Hotfix Process

For urgent fixes that need to be released immediately:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/issue-description

# Make your fix
# ... make changes ...

# Commit and push
git add .
git commit -m "Fix: description"
git push origin hotfix/issue-description

# Create PR to main
# After merge, create tag and follow steps 5-7 above

# Don't forget to merge the hotfix back to dev
git checkout dev
git merge main
git push origin dev
```

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_MIT) and [Apache License](https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_APACHE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/protofire/telos-privacy-wallet/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/protofire/telos-privacy-wallet/issues); it's that easy!

## Write bug reports with detail, background, and sample code
The issues with the bug report should be well-described. It should include at least the following sections:
- Expected Behavior
- Actual Behavior
- Steps to reproduce
  - Be specific!
- Any references regarding a bug (screenshots with errors, etc)
- Your machine info (platform, OS version, browser/Electron version, wallet provider)
- zkTelos Wallet version (found in the app or in package.json)

## License
By contributing, you agree that your contributions will be licensed under its [MIT License](https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_MIT) and [Apache-2.0 Licence](https://github.com/protofire/telos-privacy-wallet/blob/main/LICENSE_APACHE).