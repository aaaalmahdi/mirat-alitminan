# Archived deployment fallback

This directory is retained for repository history only and is not deployed.

Use:

```text
Settings → Pages → Source: GitHub Actions
```

The workflow stages an explicit `_site` directory from the root files. Do not configure GitHub Pages to publish `main/docs`, because the historical files in this directory are not the source of truth.
