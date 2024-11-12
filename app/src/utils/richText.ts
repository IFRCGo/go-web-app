import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type CellRichTextValue } from 'exceljs';

export interface ParsePlugin {
    tag: string,
    transformer: (token: string, richText: CellRichTextValue['richText'][number]) => CellRichTextValue['richText'][number],
}

const boldPlugin: ParsePlugin = {
    tag: 'b',
    transformer: (_: string, richText) => ({
        ...richText,
        font: {
            ...richText.font,
            bold: true,
        },
    }),
};
const italicsPlugin: ParsePlugin = {
    tag: 'i',
    transformer: (_: string, richText) => ({
        ...richText,
        font: {
            ...richText.font,
            italic: true,
        },
    }),
};
const underlinePlugin: ParsePlugin = {
    tag: 'u',
    transformer: (_: string, richText) => ({
        ...richText,
        font: {
            ...richText.font,
            underline: true,
        },
    }),
};

/**
 * Convert subset of html into excel's richtext format
 * @param value string with or without html tags
 */
export function parsePseudoHtml(
    value: undefined,
    extraPlugins?: ParsePlugin[],
): undefined;
export function parsePseudoHtml(
    value: string,
    extraPlugins?: ParsePlugin[],
): string | CellRichTextValue
export function parsePseudoHtml(
    value: string | undefined,
    extraPlugins?: ParsePlugin[],
): string | CellRichTextValue | undefined
export function parsePseudoHtml(
    value: string | undefined,
    extraPlugins: ParsePlugin[] = [],
): string | CellRichTextValue | undefined {
    if (isNotDefined(value)) {
        return value;
    }

    const plugins: ParsePlugin[] = [
        boldPlugin,
        italicsPlugin,
        underlinePlugin,
        ...extraPlugins,
    ];

    const supportedTags = plugins.map((p) => p.tag).join('|');

    const tagRegex = RegExp(`(</?(?:${supportedTags})>)`);
    const tokens = value.split(tagRegex);
    if (tokens.length === 1) {
        return value;
    }

    const openTagRegex = RegExp(`<(?:${supportedTags})>`);
    const closeTagRegex = RegExp(`</(?:${supportedTags})>`);

    const stack: string[] = [];
    const richText = tokens.map((token) => {
        if (token.match(openTagRegex)) {
            stack.push(token);
            return undefined;
        }
        if (token.match(closeTagRegex)) {
            // TODO: Check correctness by checking closeTag with last openTag
            stack.pop();
            return undefined;
        }

        const applicablePlugins = plugins
            .filter((plugin) => stack.includes(`<${plugin.tag}>`));

        const richTextItem: CellRichTextValue['richText'][number] = applicablePlugins
            .reduce(
                (acc, plugin) => plugin.transformer(token, acc),
                { text: token },
            );
        if (richTextItem.text === '') {
            return undefined;
        }
        return richTextItem;
    }).filter(isDefined);

    return { richText };
}
