import { isNotDefined } from '@togglecorp/fujs';
import { type CellRichTextValue } from 'exceljs';

/**
 * exceljs cannot auto-fit a row, and Excel only re-measures a wrapped cell when the
 * user edits it — so a workbook we write with no explicit height renders every row at
 * the sheet default and clips anything longer. These helpers estimate the height a
 * wrapped cell needs so it can be written into the file up front.
 */

// A column width counts characters of the default 11pt font, so a larger font fits
// proportionally fewer characters on a line.
const BASE_FONT_SIZE = 11;

// One indentation step is drawn about a character and a half wide.
const INDENT_CHAR_WIDTH = 1.5;

// Calibrated against LibreOffice's own auto-fit output for an 11pt wrapped cell:
// 3 lines -> 39.55pt, 5 -> 64.90pt, 7 -> 90.25pt.
const FIRST_LINE_FACTOR = 1.29;
const EXTRA_LINE_FACTOR = 1.15;

// Poppins and Montserrat are not embedded in the workbook, so Excel substitutes a
// font whose glyphs run a little wider than we assume. Over-estimate: extra
// whitespace reads as deliberate, a clipped question reads as broken.
const SAFETY_FACTOR = 1.08;

const MIN_ROW_HEIGHT = 30;

// Excel's own limit is 409.5pt. Stop far short of it: one pathological guidance
// string should not cost a whole screen of scrolling.
const MAX_ROW_HEIGHT = 120;

// What the label padding hack used to buy a free-text answer: room to see roughly
// six lines of what you are typing.
export const MIN_TEXTAREA_ROW_HEIGHT = 90;

interface MeasuredCell {
    value: string | CellRichTextValue | undefined;
    columnWidth: number;
    fontSize: number;
    // Indent is charged to the text, not the column, so a deeply nested label wraps
    // sooner than its column width suggests.
    indent?: number;
}

function flattenCellText(value: string | CellRichTextValue | undefined) {
    if (isNotDefined(value)) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    return value.richText.map((segment) => segment.text).join('');
}

function getCharsPerLine(columnWidth: number, fontSize: number, indent: number) {
    const usableWidth = columnWidth - indent * INDENT_CHAR_WIDTH;

    return Math.max(1, (usableWidth * BASE_FONT_SIZE) / fontSize);
}

function countWrappedLines(text: string, charsPerLine: number) {
    let lines = 0;

    text.split('\n').forEach((paragraph) => {
        const words = paragraph.split(' ').filter((word) => word !== '');

        if (words.length === 0) {
            lines += 1;
            return;
        }

        let remaining = 0;

        words.forEach((word) => {
            if (remaining === 0 || word.length + 1 > remaining) {
                lines += 1;
                remaining = charsPerLine;
            } else {
                // The space that joins this word to the previous one.
                remaining -= 1;
            }

            // A word wider than the column keeps wrapping onto further lines.
            while (word.length > remaining) {
                lines += 1;
                remaining += charsPerLine;
            }

            remaining -= word.length;
        });
    });

    return lines;
}

function getTextHeight(lines: number, fontSize: number) {
    return FIRST_LINE_FACTOR * fontSize + (lines - 1) * EXTRA_LINE_FACTOR * fontSize;
}

export function getRowHeight(cells: MeasuredCell[], minHeight = MIN_ROW_HEIGHT) {
    const tallest = Math.max(
        ...cells.map((cell) => {
            const text = flattenCellText(cell.value);

            if (text === '') {
                return 0;
            }

            const charsPerLine = getCharsPerLine(
                cell.columnWidth,
                cell.fontSize,
                cell.indent ?? 0,
            );

            return getTextHeight(countWrappedLines(text, charsPerLine), cell.fontSize);
        }),
    );

    return Math.min(
        MAX_ROW_HEIGHT,
        Math.max(minHeight, Math.ceil(tallest * SAFETY_FACTOR)),
    );
}
