#!/usr/bin/env bash

set -euo pipefail

BASE_URL="https://kilogramme-shop.com"
OUTPUT_DIR="${1:-./archive/kilogrammes}"
WORK_DIR="$OUTPUT_DIR/work"
HTML_DIR="$OUTPUT_DIR/html"
ASSET_DIR="$OUTPUT_DIR/assets"
URLS_FILE="$WORK_DIR/urls.txt"
ASSET_URLS_FILE="$WORK_DIR/asset-urls.txt"
SNAPSHOT_LOG="$WORK_DIR/snapshot-status.txt"

mkdir -p "$WORK_DIR" "$HTML_DIR" "$ASSET_DIR"

fetch_urls() {
  local sitemap_index="$WORK_DIR/sitemap-index.xml"
  curl -L --fail --silent --show-error "$BASE_URL/sitemap_index.xml" -o "$sitemap_index"

  grep -oP '(?<=<loc>)[^<]+' "$sitemap_index" | while read -r sitemap_url; do
    curl -L --fail --silent --show-error "$sitemap_url" >> "$WORK_DIR/all-sitemaps.xml"
    printf '\n' >> "$WORK_DIR/all-sitemaps.xml"
  done

  grep -oP '(?<=<loc>)[^<]+' "$WORK_DIR/all-sitemaps.xml" | sort -u > "$URLS_FILE"

  if curl -L --fail --silent --show-error "$BASE_URL/html-sitemap/" -o "$WORK_DIR/html-sitemap.html"; then
    perl -0ne 'while(/href=["\x27](https:\/\/kilogrammes\.com\/[^"\x27#]+)["\x27]/g){print "$1\n"}' "$WORK_DIR/html-sitemap.html" \
      | sort -u >> "$URLS_FILE"
    sort -u "$URLS_FILE" -o "$URLS_FILE"
  fi
}

snapshot_pages() {
  : > "$SNAPSHOT_LOG"

  while read -r url; do
    local path rel_dir target
    path="${url#${BASE_URL}}"
    path="${path#/}"

    if [[ -z "$path" ]]; then
      target="$HTML_DIR/index.html"
    else
      rel_dir="$HTML_DIR/$path"
      mkdir -p "$rel_dir"
      target="$rel_dir/index.html"
    fi

    if curl -L --fail --silent --show-error "$url" -o "$target"; then
      printf 'ok %s\n' "$url" >> "$SNAPSHOT_LOG"
    else
      printf 'fail %s\n' "$url" >> "$SNAPSHOT_LOG"
    fi
  done < "$URLS_FILE"
}

extract_assets() {
  find "$HTML_DIR" -name '*.html' -print0 \
    | xargs -0 perl -0ne '
        while(/(?:src|data-src|poster|content)=["\x27](https?:\/\/[^"\x27]+\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm|mov|pdf|woff2?|ttf))(?:\?[^"\x27]*)?["\x27]/sig){print "$1\n"}
        while(/srcset=["\x27]([^"\x27]+)["\x27]/sig){
          $set = $1;
          while($set =~ /(https?:\/\/[^ ,]+\.(?:avif|gif|jpe?g|png|svg|webp))(?:\?[^ ,]*)?/g){print "$1\n"}
        }
      ' \
    | grep '^https://kilogramme-shop.com/' \
    | grep -vE '/wp-content/uploads/.*-[0-9]+x[0-9]+\.' \
    | sort -u > "$ASSET_URLS_FILE"
}

download_assets() {
  while read -r asset_url; do
    local asset_path dest_dir dest_file
    asset_path="${asset_url#${BASE_URL}/}"
    dest_file="$ASSET_DIR/$asset_path"
    dest_dir="$(dirname "$dest_file")"
    mkdir -p "$dest_dir"
    curl -L --fail --silent --show-error "$asset_url" -o "$dest_file"
  done < "$ASSET_URLS_FILE"
}

write_summary() {
  {
    echo "Base URL: $BASE_URL"
    echo "Snapshot directory: $HTML_DIR"
    echo "Asset directory: $ASSET_DIR"
    echo "URL count: $(wc -l < "$URLS_FILE")"
    echo "Asset count: $(wc -l < "$ASSET_URLS_FILE")"
    echo "Snapshot failures: $(grep -c '^fail ' "$SNAPSHOT_LOG" || true)"
  } > "$OUTPUT_DIR/summary.txt"
}

fetch_urls
snapshot_pages
extract_assets
download_assets
write_summary

echo "Archive created at $OUTPUT_DIR"