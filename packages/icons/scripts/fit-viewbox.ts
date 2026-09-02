/**
 * Adjusts the viewBox of every SVG in ./icons so it exactly fits
 * the bounding box of the visible content, removing empty padding.
 *
 * Handles: <path>, <circle>, <ellipse>, <rect>, <line>, <polygon>, <polyline>
 * Ignores elements inside <defs>, <mask>, and <clipPath> (they are not rendered directly).
 * Applies simple translate/scale transforms when present.
 *
 * Usage:
 *   pnpm fit-viewbox              # apply changes
 *   pnpm fit-viewbox --dry-run    # preview only
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { svgPathBbox } from 'svg-path-bbox';

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Minimal SVG XML helpers (regex-based, sufficient for these flat icon files)
// ---------------------------------------------------------------------------

/** Extract attribute value from a tag string. */
function attr(tag: string, name: string): string | null {
    const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
    return m ? m[1] : null;
}

/** Parse a plain number attribute, returning 0 if missing. */
function numAttr(tag: string, name: string, fallback = 0): number {
    const v = attr(tag, name);
    return v !== null ? parseFloat(v) : fallback;
}

// ---------------------------------------------------------------------------
// Transform parsing — supports translate(tx[, ty]) and scale(sx[, sy]) only
// ---------------------------------------------------------------------------

interface Transform { tx: number; ty: number; sx: number; sy: number }

const IDENTITY: Transform = { tx: 0, ty: 0, sx: 1, sy: 1 };

function parseTransform(tag: string): Transform {
    const raw = attr(tag, 'transform');
    if (!raw) return IDENTITY;

    let { tx, ty, sx, sy } = IDENTITY;

    const t = raw.match(/translate\(\s*([\d.eE+-]+)(?:[,\s]+([\d.eE+-]+))?\s*\)/);
    if (t) {
        tx = parseFloat(t[1]);
        ty = t[2] !== undefined ? parseFloat(t[2]) : tx;
    }

    const s = raw.match(/scale\(\s*([\d.eE+-]+)(?:[,\s]+([\d.eE+-]+))?\s*\)/);
    if (s) {
        sx = parseFloat(s[1]);
        sy = s[2] !== undefined ? parseFloat(s[2]) : sx;
    }

    return { tx, ty, sx, sy };
}

function applyTransform(
    [x1, y1, x2, y2]: [number, number, number, number],
    { tx, ty, sx, sy }: Transform,
): [number, number, number, number] {
    return [x1 * sx + tx, y1 * sy + ty, x2 * sx + tx, y2 * sy + ty];
}

// ---------------------------------------------------------------------------
// Per-element bounding-box calculators
// ---------------------------------------------------------------------------

type BBox = [number, number, number, number]; // [x1, y1, x2, y2]

function bboxPath(tag: string, d: string): BBox | null {
    try {
        const [x1, y1, x2, y2] = svgPathBbox(d);
        const tf = parseTransform(tag);
        return applyTransform([x1, y1, x2, y2], tf);
    } catch {
        return null;
    }
}

function bboxCircle(tag: string): BBox | null {
    const cx = numAttr(tag, 'cx');
    const cy = numAttr(tag, 'cy');
    const r = numAttr(tag, 'r');
    if (r <= 0) return null;
    const tf = parseTransform(tag);
    return applyTransform([cx - r, cy - r, cx + r, cy + r], tf);
}

function bboxEllipse(tag: string): BBox | null {
    const cx = numAttr(tag, 'cx');
    const cy = numAttr(tag, 'cy');
    const rx = numAttr(tag, 'rx');
    const ry = numAttr(tag, 'ry');
    if (rx <= 0 || ry <= 0) return null;
    const tf = parseTransform(tag);
    return applyTransform([cx - rx, cy - ry, cx + rx, cy + ry], tf);
}

function bboxRect(tag: string): BBox | null {
    const x = numAttr(tag, 'x');
    const y = numAttr(tag, 'y');
    const w = numAttr(tag, 'width');
    const h = numAttr(tag, 'height');
    if (w <= 0 || h <= 0) return null;
    const tf = parseTransform(tag);
    return applyTransform([x, y, x + w, y + h], tf);
}

function bboxLine(tag: string): BBox | null {
    const x1 = numAttr(tag, 'x1');
    const y1 = numAttr(tag, 'y1');
    const x2 = numAttr(tag, 'x2');
    const y2 = numAttr(tag, 'y2');
    const tf = parseTransform(tag);
    const [ax1, ay1, ax2, ay2] = applyTransform(
        [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)],
        tf,
    );
    return [ax1, ay1, ax2, ay2];
}

function bboxPolyPoints(tag: string): BBox | null {
    const raw = attr(tag, 'points');
    if (!raw) return null;
    const nums = raw.trim().split(/[\s,]+/).map(Number).filter(isFinite);
    if (nums.length < 2) return null;
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    const tf = parseTransform(tag);
    return applyTransform(
        [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
        tf,
    );
}

// ---------------------------------------------------------------------------
// SVG file processing
// ---------------------------------------------------------------------------

/** Returns true when the character position sits inside a non-rendering block. */
function buildBlockedRanges(svg: string): Array<[number, number]> {
    const blocked: Array<[number, number]> = [];
    for (const tag of ['defs', 'mask', 'clipPath']) {
        const openRe = new RegExp(`<${tag}[\\s>]`, 'g');
        const closeTag = `</${tag}>`;
        let m: RegExpExecArray | null;
        while ((m = openRe.exec(svg)) !== null) {
            const end = svg.indexOf(closeTag, m.index);
            if (end !== -1) blocked.push([m.index, end + closeTag.length]);
        }
    }
    return blocked;
}

function isBlocked(pos: number, blocked: Array<[number, number]>): boolean {
    return blocked.some(([s, e]) => pos >= s && pos < e);
}

/** Walk all start-tags in an SVG and compute a combined bounding box. */
function computeContentBBox(svg: string): BBox | null {
    const blocked = buildBlockedRanges(svg);
    let x1 = Infinity; let y1 = Infinity; let x2 = -Infinity; let y2 = -Infinity;
    let found = false;

    const tagRe = /<(path|circle|ellipse|rect|line|polygon|polyline)\b([^>]*?)(?:\/?>)/gs;
    let m: RegExpExecArray | null;

    while ((m = tagRe.exec(svg)) !== null) {
        if (isBlocked(m.index, blocked)) continue;

        const [fullMatch, elType, rest] = m;
        const tag = fullMatch; // full tag string for attr() helpers

        let bb: BBox | null = null;

        if (elType === 'path') {
            const d = attr(tag, 'd');
            if (d) bb = bboxPath(tag, d);
        } else if (elType === 'circle') {
            bb = bboxCircle(tag);
        } else if (elType === 'ellipse') {
            bb = bboxEllipse(tag);
        } else if (elType === 'rect') {
            bb = bboxRect(tag);
        } else if (elType === 'line') {
            bb = bboxLine(tag);
        } else if (elType === 'polygon' || elType === 'polyline') {
            bb = bboxPolyPoints(tag);
        }

        if (bb && isFinite(bb[0])) {
            x1 = Math.min(x1, bb[0]);
            y1 = Math.min(y1, bb[1]);
            x2 = Math.max(x2, bb[2]);
            y2 = Math.max(y2, bb[3]);
            found = true;
        }
    }

    return found ? [x1, y1, x2, y2] : null;
}

/** Replace the viewBox attribute value in an SVG string. */
function replaceViewBox(svg: string, vb: string): string {
    return svg.replace(/\bviewBox="[^"]*"/, `viewBox="${vb}"`);
}

/** Round to at most `dp` decimal places, stripping trailing zeros. */
function fmt(n: number, dp = 4): string {
    return parseFloat(n.toFixed(dp)).toString();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = new URL('..', import.meta.url).pathname;
const ICONS_DIR = join(ROOT, 'icons');

const files = readdirSync(ICONS_DIR).filter((f) => f.endsWith('.svg'));

let changed = 0;
let skipped = 0;

for (const file of files) {
    const filePath = join(ICONS_DIR, file);
    const svg = readFileSync(filePath, 'utf-8');

    const bb = computeContentBBox(svg);
    if (!bb) {
        skipped++;
        continue;
    }

    const [x1, y1, x2, y2] = bb;
    const newVb = `${fmt(x1)} ${fmt(y1)} ${fmt(x2 - x1)} ${fmt(y2 - y1)}`;

    // Check if viewBox already matches (avoid pointless writes)
    const existing = svg.match(/viewBox="([^"]*)"/)?.[1] ?? '';
    if (existing === newVb) continue;

    const updated = replaceViewBox(svg, newVb);
    changed++;

    if (DRY_RUN) {
        console.log(`[dry-run] ${file}`);
        console.log(`          before: ${existing}`);
        console.log(`          after:  ${newVb}`);
    } else {
        writeFileSync(filePath, updated, 'utf-8');
    }
}

const mode = DRY_RUN ? '[dry-run] ' : '';
console.log(`\n${mode}Done. ${changed} viewBoxes updated, ${skipped} files skipped (no computable bbox).`);
if (DRY_RUN) console.log('Re-run without --dry-run to apply.');
