#!/usr/bin/env bash
# Render report cards to PDF via headless Chrome, so the print CSS in
# report_cards.py (A4, page breaks, margins) is applied properly.
#
# Usage:
#   tools/make_pdfs.sh                    # every card in reports/
#   tools/make_pdfs.sh mochi polo beenie  # just these
#
# Output: reports/pdf/<name>-growth-report.pdf
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTDIR="$ROOT/reports/pdf"

[ -x "$CHROME" ] || { echo "Google Chrome not found at $CHROME" >&2; exit 1; }
mkdir -p "$OUTDIR"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [ "$#" -gt 0 ]; then
  names=("$@")
else
  names=()
  for f in "$ROOT"/reports/card-*.html; do
    b="$(basename "$f" .html)"
    names+=("${b#card-}")
  done
fi

for name in "${names[@]}"; do
  src="$ROOT/reports/card-${name}.html"
  if [ ! -f "$src" ]; then
    echo "  skip ${name} — no reports/card-${name}.html" >&2
    continue
  fi
  out="$OUTDIR/${name}-growth-report.pdf"
  # Each render gets a FRESH profile dir: reusing one across sequential headless
  # runs leaves a singleton lock behind and the next launch hangs forever.
  # Isolated from the user's real Chrome data either way.
  profile="$WORK/$name"
  rm -f "$out"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-first-run \
    --no-pdf-header-footer \
    --user-data-dir="$profile" \
    --print-to-pdf="$out" \
    "file://$src" >/dev/null 2>&1 &
  pid=$!

  # Headless Chrome often writes the PDF and then never exits, so waiting on the
  # process wastes the full timeout on every card. Watch the file instead: once
  # its size stops changing it's complete, and we can stop Chrome ourselves.
  # (macOS has no GNU `timeout`, hence the hand-rolled wait.)
  waited=0; last=-1; stable=0; ok=0
  while [ "$waited" -lt 90 ]; do
    if [ -s "$out" ]; then
      size=$(wc -c < "$out" | tr -d ' ')
      if [ "$size" = "$last" ]; then
        stable=$((stable + 1))
        [ "$stable" -ge 2 ] && { ok=1; break; }
      else
        stable=0
      fi
      last="$size"
    fi
    kill -0 "$pid" 2>/dev/null || break
    sleep 1
    waited=$((waited + 1))
  done
  kill -9 "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true

  if [ "$ok" != 1 ] && [ ! -s "$out" ]; then
    echo "  FAILED ${name} — no PDF produced within 90s" >&2
    continue
  fi
  printf '  %-10s -> %s (%s)\n' "$name" "reports/pdf/$(basename "$out")" \
    "$(du -h "$out" | cut -f1 | tr -d ' ')"
done
