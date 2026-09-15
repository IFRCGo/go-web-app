/**
 * Converts SVG files in ./icons into context-aware React TSX components
 * in ./src/components, then regenerates ./src/index.ts.
 *
 * Usage: pnpm generate
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPascalCase(str: string): string {
    return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function getComponentName(filename: string): string {
    return `${toPascalCase(basename(filename, '.svg'))}Icon`;
}

/** Convert a kebab-case CSS property name to camelCase. */
function cssPropToCamel(prop: string): string {
    return prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Convert an inline SVG style string to a JSX style object expression.
 * e.g. "mask-type:luminance;opacity:0.5" → `{{maskType: 'luminance', opacity: '0.5'}}`
 */
function styleStringToJsx(css: string): string {
    const entries = css
        .split(';')
        .map((decl) => decl.trim())
        .filter(Boolean)
        .map((decl) => {
            const colon = decl.indexOf(':');
            const prop = cssPropToCamel(decl.slice(0, colon));
            const value = decl.slice(colon + 1).trim();
            return `${prop}: '${value}'`;
        });
    return `{{${entries.join(', ')}}}`;
}

/** Convert SVG attribute names and inline style strings to their JSX equivalents. */
function svgToJsx(content: string): string {
    return content
        // Convert inline style="..." strings to JSX style={{...}} objects
        .replace(/\bstyle="([^"]+)"/g, (_, css: string) => `style=${styleStringToJsx(css)}`)
        // Attribute renames
        .replace(/\bclip-path=/g, 'clipPath=')
        .replace(/\bfill-rule=/g, 'fillRule=')
        .replace(/\bclip-rule=/g, 'clipRule=')
        .replace(/\bstroke-width=/g, 'strokeWidth=')
        .replace(/\bstroke-linecap=/g, 'strokeLinecap=')
        .replace(/\bstroke-linejoin=/g, 'strokeLinejoin=')
        .replace(/\bstroke-dasharray=/g, 'strokeDasharray=')
        .replace(/\bstroke-dashoffset=/g, 'strokeDashoffset=')
        .replace(/\bfill-opacity=/g, 'fillOpacity=')
        .replace(/\bstroke-opacity=/g, 'strokeOpacity=')
        .replace(/\bstop-color=/g, 'stopColor=')
        .replace(/\bstop-opacity=/g, 'stopOpacity=')
        .replace(/\bcolor-interpolation-filters=/g, 'colorInterpolationFilters=')
        .replace(/\bflood-color=/g, 'floodColor=')
        .replace(/\bflood-opacity=/g, 'floodOpacity=')
        .replace(/\bmarker-end=/g, 'markerEnd=')
        .replace(/\bmarker-mid=/g, 'markerMid=')
        .replace(/\bmarker-start=/g, 'markerStart=')
        .replace(/\btext-anchor=/g, 'textAnchor=')
        .replace(/\bxlink:href=/g, 'xlinkHref=')
        .replace(/\bxml:space=/g, 'xmlSpace=')
        .replace(/\bclass=/g, 'className=');
}

interface SvgParts {
    viewBox: string;
    inner: string;
}

function parseSvg(raw: string): SvgParts {
    const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // Everything between the opening <svg ...> tag and </svg>
    const innerMatch = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>\s*$/);
    const inner = innerMatch ? innerMatch[1].trim() : '';

    return { viewBox, inner: svgToJsx(inner) };
}

function generateComponentSource(name: string, viewBox: string, inner: string): string {
    return `import { forwardRef } from 'react';
import type { SVGProps } from 'react';
import useIconsContext from '../useIconsContext';

type Props = SVGProps<SVGSVGElement> & {
    /** Shorthand for both width and height; overrides provider size. */
    size?: number | string;
};

const ${name} = forwardRef<SVGSVGElement, Props>(
    (
        {
            size: sizeProp,
            width,
            height,
            className,
            style,
            ...props
        },
        ref,
    ) => {
        const {
            size: contextSize,
            className: contextClassName,
            style: contextStyle,
        } = useIconsContext();

        const resolvedSize = sizeProp ?? contextSize;

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                viewBox="${viewBox}"
                fill="currentColor"
                ref={ref}
                width={width ?? resolvedSize ?? '1em'}
                height={height ?? resolvedSize ?? '1em'}
                className={
                    [contextClassName, className].filter(Boolean).join(' ') || undefined
                }
                style={{ ...contextStyle, ...style }}
                {...props}
            >
                ${inner}
            </svg>
        );
    },
);

${name}.displayName = '${name}';

export default ${name};
`;
}

function generateIconsBarrel(componentNames: string[]): string {
    const exports = componentNames
        .sort()
        .map((n) => `export { default as ${n} } from './components/${n}';`)
        .join('\n');

    return `// Auto-generated by scripts/generate.ts — do not edit manually.
// Re-run \`pnpm generate\` to refresh after adding or modifying SVG files.
${exports}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = new URL('..', import.meta.url).pathname;
const ICONS_DIR = join(ROOT, 'icons');
const COMPONENTS_DIR = join(ROOT, 'src', 'components');
const BARREL_FILE = join(ROOT, 'src', 'icons.generated.ts');

if (!existsSync(ICONS_DIR)) {
    console.error(`icons/ directory not found at ${ICONS_DIR}`);
    console.error('Run `pnpm download` first to fetch SVG files from GitHub.');
    process.exit(1);
}

mkdirSync(COMPONENTS_DIR, { recursive: true });

const svgFiles = readdirSync(ICONS_DIR).filter((f) => f.endsWith('.svg'));

if (svgFiles.length === 0) {
    console.warn('No SVG files found in icons/. Run `pnpm download` first.');
    process.exit(0);
}

console.log(`Processing ${svgFiles.length} SVG files...`);

const componentNames: string[] = [];

for (const file of svgFiles) {
    const raw = readFileSync(join(ICONS_DIR, file), 'utf-8');
    const name = getComponentName(file);
    const { viewBox, inner } = parseSvg(raw);

    const source = generateComponentSource(name, viewBox, inner);
    writeFileSync(join(COMPONENTS_DIR, `${name}.tsx`), source, 'utf-8');
    componentNames.push(name);
}

writeFileSync(BARREL_FILE, generateIconsBarrel(componentNames), 'utf-8');

console.log(`Generated ${componentNames.length} components → src/components/`);
console.log('Updated src/icons.generated.ts');
