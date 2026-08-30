# IFRC GO - Deployment Workflow

This document covers how code moves from the project branch through alpha, staging, and production. For the development workflow (branching, PRs, rebase), see [Development Workflow](./development-workflow.md).

---

## Environment Reference

| Environment | URL | Branch / image deployed |
|---|---|---|
| **Alpha** | internal | `project/<n>` branch |
| **Staging** | `go-stage.ifrc.org` | `develop` (beta release tag) |
| **Production** | `go.ifrc.org` | Tagged release (e.g. `go-web-app@7.x.x`) |

Admin staging is at `goadmin-stage.ifrc.org`. Ensure it is in sync before requesting UAT.

---

## Step-by-Step Workflow

### 1. Deploy the project branch to the alpha instance

Once a meaningful set of features is merged to the project branch, trigger a deployment to the alpha environment. The CI/CD pipeline (`/.github/workflows/`) handles this on push to the project branch. Verify the web-app-serve Docker image and Helm chart are built and published (see the `Publish web app serve` workflow) for the deployment.

The alpha instance runs the **project branch** directly. It is a pre-QA environment and may be unstable.

---

### 2. Run QA on the alpha instance

The QA team runs the full test suite and exploratory testing against the alpha instance. File issues directly against the project branch. Developers fix, re-deploy, and iterate until QA passes.

---

### 3. Create a beta release and deploy to staging

After the project branch is [merged to `develop`](./development-workflow.md#5-merge-the-project-branch-to-develop), the new beta version is created using the changeset along with the necessary tags. Review and push it to bump package versions and update the changelog file, then trigger the beta release pipeline:

Enter beta pre-release mode in changeset (if not already)
```bash
pnpm changeset pre enter beta
```

And then proceed updating changelog and creating tags

```bash
pnpm changeset version
git diff
git add -A
git commit -m "v7.27.0-beta.2"
pnpm changeset tag
git push --follow-tags
```

> [!NOTE]
> - Azure deployment needs to be triggered manually for the frontend.
> - New release needs to be created manually in GitHub with the pushed tags. For beta releases, it should be marked as pre-release.
> - Backend has a separate deployment process.

---

### 4. Run sanity test and request IFRC UAT

With the beta deployed to staging:

1. Run a smoke test against `go-stage.ifrc.org` and `goadmin-stage.ifrc.org` to confirm
   the deployment is healthy and the admin backend is in sync.
2. Share the staging URL with the IFRC team and request
   **User Acceptance Testing (UAT)**.
3. Collect feedback. If blockers are found, fix them on `develop`, cut a new beta
   (e.g. `go-web-app@7.24.0-beta.1`), and redeploy to staging.

---

### 5. Create a production release and deploy to production

Once UAT is approved, create new prod release.

Exit beta pre-release mode in changeset

```bash
pnpm changeset pre exit
```

Now proceed with updating changelog and generating the appropriate tags

```bash
pnpm changeset version
git diff
git add -A
git commit -m "v7.27.0"
pnpm changeset tag
git push --follow-tags
```

Once these changes are pushed to `develop`, a fresh `release` branch from `develop` is created and force-pushed. The prod release is then done from the `release` branch through Azure pipeline.

> [!NOTE]
> - Azure deployment needs to be triggered manually for the frontend.
> - New release needs to be created manually in GitHub with the pushed tags. For prod releases, it should be marked as latest release.
> - Backend has a separate deployment process.

---

## Hotfixes

Hotfixes that must reach production immediately bypass the project branch: branch off `release`, open the PR directly to `release`, and deploy from there. An equivalent PR must be included to `develop` branch as well to assure that the changes are reflected there too.
