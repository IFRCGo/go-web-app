/**
 * Strips redundant <g clip-path> wrappers from SVG icons.
 *
 * Many icons have this structure:
 *
 *   <g clip-path="url(#some-id)">
 *     <path .../>
 *   </g>
 *   <defs>
 *     <clipPath id="some-id">
 *       <path d="M0 0h24v24H0z"/>   ← rectangle = full viewBox → clips nothing
 *     </clipPath>
 *   </defs>
 *
 * The clip-path is a rectangle identical to the viewBox, so it is 100% redundant.
 * This script unwraps the <g>, removes the matching <clipPath> from <defs>,
 * and removes <defs> altogether if it becomes empty.
 *
 * Only strips a clip-path when its bounding box provably covers the full viewBox
 * (within a 1px tolerance to handle floating-point rounding).
 *
 * Usage: pnpm strip-padding
 * Dry run (no writes): pnpm strip-padding --dry-run
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Mini path interpreter — handles M/H/h/V/v/Z/z only (simple rectangles)
// Returns {minX, minY, maxX, maxY} or null if path uses unsupported commands.
// ---------------------------------------------------------------------------

interface BBox { minX: number; minY: number; maxX: number; maxY: number }

function rectBBox(d: string): BBox | null {
    // Tokenise into [command, ...numbers] pairs
    const tokens = d.trim().match(/[MHhVvZz]|[-\d.]+(?:e[-+]?\d+)?/gi);
    if (!tokens) return null;

    let x = 0; let y = 0;
    let minX = Infinity; let minY = Infinity;
    let maxX = -Infinity; let maxY = -Infinity;

    const visit = (nx: number, ny: number) => {
        if (nx < minX) minX = nx;
        if (ny < minY) minY = ny;
        if (nx > maxX) maxX = nx;
        if (ny > maxY) maxY = ny;
    };

    let i = 0;
    while (i < tokens.length) {
        const cmd = tokens[i];
        i++;

        if (cmd === 'M') {
            x = parseFloat(tokens[i++]);
            y = parseFloat(tokens[i++]);
            visit(x, y);
        } else if (cmd === 'H') {
            x = parseFloat(tokens[i++]);
            visit(x, y);
        } else if (cmd === 'h') {
            x += parseFloat(tokens[i++]);
            visit(x, y);
        } else if (cmd === 'V') {
            y = parseFloat(tokens[i++]);
            visit(x, y);
        } else if (cmd === 'v') {
            y += parseFloat(tokens[i++]);
            visit(x, y);
        } else if (cmd === 'Z' || cmd === 'z') {
            // close — no new point needed for bounding box purposes
        } else {
            // Unsupported command (curves etc.) — bail out
            return null;
        }
    }

    if (!isFinite(minX)) return null;
    return { minX, minY, maxX, maxY };
}

/** Returns true if the clipPath rect fully covers the viewBox (within 1px). */
function isFullViewBoxRect(pathD: string, vbW: number, vbH: number): boolean {
    const bb = rectBBox(pathD);
    if (!bb) return false;
    const EPS = 1;
    return (
        bb.minX <= EPS &&
        bb.minY <= EPS &&
        bb.maxX >= vbW - EPS &&
        bb.maxY >= vbH - EPS
    );
}

// ---------------------------------------------------------------------------
// SVG stripping
// ---------------------------------------------------------------------------

interface ParsedViewBox { w: number; h: number }

function parseViewBox(svg: string): ParsedViewBox | null {
    const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if (!m) return null;
    return { w: parseFloat(m[1]), h: parseFloat(m[2]) };
}

/**
 * Strips redundant clip-path wrappers from an SVG string.
 * Returns the stripped string, or the original if nothing was removed.
 */
function stripPadding(svg: string): { result: string; stripped: number } {
    const vb = parseViewBox(svg);
    if (!vb) return { result: svg, stripped: 0 };

    let result = svg;
    let stripped = 0;

    // Find all <clipPath id="..."> definitions and record which ones are
    // full-viewBox rectangles so we can safely unwrap them.
    const clipDefRe = /<clipPath\s+id="([^"]+)">\s*<path\s+[^>]*d="([^"]+)"[^>]*\/>\s*<\/clipPath>/gs;
    const safeIds = new Set<string>();

    for (const m of result.matchAll(clipDefRe)) {
        const [, id, d] = m;
        if (isFullViewBoxRect(d, vb.w, vb.h)) {
            safeIds.add(id);
        }
    }

    if (safeIds.size === 0) return { result: svg, stripped: 0 };

    // Unwrap <g clip-path="url(#id)">…</g> for each safe id.
    // We match greedily up to the LAST </g> so nested elements are preserved.
    for (const id of safeIds) {
        // Escaped id for regex (ids like "add-box-fill_svg__a" are safe but escape just in case)
        const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const gRe = new RegExp(
            `<g[^>]*clip-path="url\\(#${escapedId}\\)"[^>]*>([\\s\\S]*?)<\\/g>(?=\\s*(?:<defs|<\\/svg))`,
            'g',
        );

        const before = result;
        result = result.replace(gRe, (_match, inner: string) => inner.trim());
        if (result !== before) stripped++;
    }

    // Remove <clipPath> entries for safe ids from <defs>.
    for (const id of safeIds) {
        const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cpRe = new RegExp(
            `\\s*<clipPath\\s+id="${escapedId}">[\\s\\S]*?<\\/clipPath>`,
            'g',
        );
        result = result.replace(cpRe, '');
    }

    // Remove <defs>...</defs> blocks that are now empty (only whitespace inside).
    result = result.replace(/<defs>\s*<\/defs>/g, '');

    // Normalise extra blank lines left behind inside <svg>
    result = result.replace(/(\n\s*){3,}/g, '\n');

    return { result, stripped };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = new URL('..', import.meta.url).pathname;
const ICONS_DIR = join(ROOT, 'icons');

const files = readdirSync(ICONS_DIR).filter((f) => f.endsWith('.svg'));

let totalStripped = 0;
let filesChanged = 0;

for (const file of files) {
    const filePath = join(ICONS_DIR, file);
    const original = readFileSync(filePath, 'utf-8');
    const { result, stripped } = stripPadding(original);

    if (stripped > 0 && result !== original) {
        filesChanged++;
        totalStripped += stripped;
        if (DRY_RUN) {
            console.log(`[dry-run] Would strip ${stripped} clip-path(s) from ${file}`);
        } else {
            writeFileSync(filePath, result, 'utf-8');
        }
    }
}

const mode = DRY_RUN ? '[dry-run] ' : '';
console.log(
    `${mode}Done. ${filesChanged} files changed, ${totalStripped} redundant clip-path(s) removed.`,
);
if (DRY_RUN) {
    console.log('Re-run without --dry-run to apply changes.');
}
