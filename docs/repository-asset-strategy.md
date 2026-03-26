# Repository Asset Strategy

## Current State

- `main` and `origin/main` are aligned after the storefront work was split into five commits.
- Git object storage is already about `476 MiB` (`git count-objects -vH`).
- The tracked `public/imported` tree contains `3303` files and is the main source of repository growth.
- `git-lfs` is not installed in the current environment.
- No `.gitattributes` file exists yet.

## What Is Taking Space

Most tracked files under `public/imported` are image assets mirrored from the source WordPress site:

- `2559` `.jpg`
- `609` `.webp`
- `120` `.png`
- `7` `.svg`
- `4` `.pdf`
- `2` `.jpeg`

The largest individual tracked assets are already several megabytes each, including:

- `public/imported/kilogrammes/wp-content/uploads/2024/03/rosa-rafael-Pe9IXUuC6QU-unsplash.webp` (`8.58 MiB`)
- `public/imported/kilogrammes/wp-content/uploads/2024/04/chase-fade-fvUv8dLKuSI-unsplash.webp` (`8.13 MiB`)
- `public/imported/kilogrammes/wp-content/uploads/2024/04/fellipe-ditadi-jBCR89Q4BmM-unsplash.webp` (`7.94 MiB`)
- `public/imported/kilogrammes/shop_kilogrammes.pdf` (`7.09 MiB`)

The densest buckets are concentrated in WordPress upload folders such as `2022/12`, `2024/02`, `2024/03`, `2024/04`, and several `2025/*` buckets.

## Risk

Splitting commits made pushes more reliable, but it did not reduce repository weight. If imported media keeps growing inside normal Git history:

- clone and fetch times will keep increasing
- future pushes will become less reliable again
- routine history operations will get slower

## Recommended Path

### Phase 1: Stop Future Growth

Use Git LFS for future large binary assets before adding more imported media.

Suggested patterns:

- `public/imported/**/*.jpg`
- `public/imported/**/*.jpeg`
- `public/imported/**/*.png`
- `public/imported/**/*.webp`
- `public/imported/**/*.pdf`

This is the lowest-risk change because it avoids rewriting current history.

### Phase 2: Decide Whether Existing History Should Move

Only migrate existing tracked assets into Git LFS if repository size becomes a real operational problem and history rewrite is acceptable.

This would require:

1. installing `git-lfs`
2. adding `.gitattributes`
3. rewriting history for existing imported binaries
4. force-pushing the rewritten branch
5. ensuring every collaborator re-syncs cleanly

This is higher risk than Phase 1 because the repo was only recently rewritten and re-pushed.

### Phase 3: Reduce What Needs Versioning

Longer term, the best repository shape is usually:

- keep code, generated JSON snapshots, and critical hand-maintained assets in Git
- keep mirrored bulk media outside normal Git history when possible
- regenerate or re-sync imported media from a scriptable source when practical

For this repo, that likely means reviewing whether all files in `public/imported` must stay committed, or whether some can be reproduced from the extraction/snapshot pipeline.

## Practical Next Step

The safest next move is:

1. install `git-lfs`
2. track future `public/imported` binaries with LFS
3. leave current history untouched for now
4. revisit a full migration only if repo growth continues

That gives immediate protection against further growth without another disruptive history rewrite.