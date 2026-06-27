import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import xlsx, {
    type CellRichTextValue,
    type Row,
    type Style,
    type Workbook,
    type Worksheet,
} from 'exceljs';
import FileSaver from 'file-saver';

import ifrcLogoFile from '#assets/icons/ifrc-square.png';
import {
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    FONT_FAMILY_HEADER,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    DREF_OPTIONS_SHEET_NAME,
    DREF_TYPE_CELL_COLUMN,
    DREF_TYPE_CELL_ROW,
    type DrefSheetName,
    getDrefSheetNames,
    SHEET_ACTIONS_NEEDS,
    SHEET_EVENT_DETAIL,
    SHEET_OPERATION,
    SHEET_OPERATION_OVERVIEW,
    SHEET_TIMEFRAMES_AND_CONTACTS,
} from '#utils/domain/dref';
import {
    getCombinedKey,
    type TemplateField,
} from '#utils/importTemplate';
import { parsePseudoHtml } from '#utils/richText';
import {
    actionsTabFields,
    eventDetailTabFields,
    operationTabFields,
    overviewTabFields,
    timeframeAndContactsTabFields,
} from '#views/DrefApplicationForm/common';

import {
    type OptionsMapping,
    type TemplateStrings,
} from './useImportTemplateSchema';

type CoverStrings = TemplateStrings['cover'];
interface ValidationStrings {
    numberError: string;
    integerError: string;
    dateError: string;
    listError: string;
    errorTitle: string;
}

// FIXME: move to utils
function hexToArgb(hexStr: string, alphaStr = 'ff') {
    const hexWithoutHash = hexStr.substring(1);

    return `${alphaStr}${hexWithoutHash}`;
}

const h1Style: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
        color: { argb: hexToArgb(COLOR_WHITE, '10') },
        // FIXME: use constant
        size: 12,
        bold: true,
    },
    alignment: {
        horizontal: 'center',
        vertical: 'middle',
    },
    fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: hexToArgb(COLOR_PRIMARY_BLUE, '10') },
    },
};

const h2Style: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
        color: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') },
        bold: true,
    },
    alignment: {
        horizontal: 'center',
        vertical: 'middle',
    },
};

const h3Style: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
        color: { argb: hexToArgb(COLOR_PRIMARY_BLUE, '10') },
        bold: true,
    },
    alignment: {
        horizontal: 'center',
        vertical: 'middle',
    },
};

const defaultCellStyle: Partial<Style> = {
    font: {
        // FIXME: use constant
        name: 'Poppins',
    },
    alignment: {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
    },
};

const descriptionCellStyle: Partial<Style> = {
    font: {
        // FIXME: use constant
        name: 'Poppins',
        // FIXME: use constant
        size: 10,
        // FIXME: use constant
        color: { argb: hexToArgb('#3f3f3f', '10') },
    },
    alignment: {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
    },
};

const alternateRowStyle = {
    fill: {
        type: 'pattern',
        pattern: 'solid',
        // FIXME: use constant
        fgColor: { argb: hexToArgb('#f2f2f2', '10') },
    },
} as const satisfies Partial<Style>;

function addRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string | CellRichTextValue,
    description?: string | CellRichTextValue,
    style: Partial<xlsx.Style> = defaultCellStyle,
) {
    const row = sheet.getRow(rowNum);
    row.outlineLevel = outlineLevel;

    const col = 1;
    const labelCell = row.getCell(col);
    const valueCell = row.getCell(col + 1);
    const descriptionCell = row.getCell(col + 2);

    labelCell.name = name;
    valueCell.name = name;

    labelCell.value = label;
    if (
        (typeof description === 'object' && description.richText.length > 0)
        || (typeof description === 'string' && isTruthyString(description))
    ) {
        descriptionCell.value = description;
    }

    labelCell.style = {
        ...style,
        alignment: {
            ...style?.alignment,
            indent: outlineLevel * 2,
        },
    };
    valueCell.style = style;
    descriptionCell.style = {
        ...style,
        ...descriptionCellStyle,
        font: {
            ...style.font,
            ...descriptionCellStyle.font,
        },
        alignment: {
            ...style.alignment,
            ...descriptionCellStyle.alignment,
        },
    };

    const cellBorder: Style['border'] = {
        // FIXME: use constant
        bottom: { style: 'thin', color: { argb: hexToArgb('#bfbfbf', '10') } },
        // FIXME: use constant
        top: { style: 'thin', color: { argb: hexToArgb('#bfbfbf', '10') } },
        // FIXME: use constant
        left: { style: 'thin', color: { argb: hexToArgb('#bfbfbf', '10') } },
        // FIXME: use constant
        right: { style: 'thin', color: { argb: hexToArgb('#bfbfbf', '10') } },
    };
    labelCell.border = cellBorder;
    valueCell.border = cellBorder;
    descriptionCell.border = cellBorder;

    return row;
}

function addHeadingRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description?: string,
) {
    let style = h3Style;
    if (outlineLevel === 0) {
        style = h1Style;
    } else if (outlineLevel === 1) {
        style = h2Style;
    }

    return addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
        description,
        style,
    );
}

function addInputRow(
    validationStrings: ValidationStrings,
    rowType: 'alt' | 'normal',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string | CellRichTextValue,
    description: string | CellRichTextValue | undefined,
    dataValidation?: 'number' | 'integer' | 'date' | 'text',
): Row
function addInputRow(
    validationStrings: ValidationStrings,
    rowType: 'alt' | 'normal',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string | CellRichTextValue,
    description: string | CellRichTextValue | undefined,
    dataValidation?: 'list',
    optionKey?: string,
    optionsWorksheet?: Worksheet,
): Row
function addInputRow(
    validationStrings: ValidationStrings,
    rowType: 'alt' | 'normal',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string | CellRichTextValue,
    description?: string | CellRichTextValue | undefined,
    dataValidation?: 'number' | 'integer' | 'date' | 'text' | 'list',
    optionKey?: string,
    optionsWorksheet?: Worksheet,
): Row {
    const col = 1;
    const row = addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
        description,
    );

    const inputCell = row.getCell(col + 1);

    if (rowType === 'alt') {
        const firstCell = row.getCell(col);
        firstCell.style = {
            ...firstCell.style,
            ...alternateRowStyle,
            fill: {
                ...firstCell.style?.fill,
                ...alternateRowStyle.fill,
            },
        };
        const secondCell = row.getCell(col + 1);
        secondCell.style = {
            ...secondCell.style,
            ...alternateRowStyle,
            fill: {
                ...secondCell.style?.fill,
                ...alternateRowStyle.fill,
            },
        };
        const thirdCell = row.getCell(col + 2);
        thirdCell.style = {
            ...thirdCell.style,
            ...alternateRowStyle,
            fill: {
                ...thirdCell.style?.fill,
                ...alternateRowStyle.fill,
            },
        };
    }

    if (dataValidation === 'number') {
        inputCell.dataValidation = {
            type: 'decimal',
            operator: 'greaterThan',
            formulae: [0],
            error: validationStrings.numberError,
            errorTitle: validationStrings.errorTitle,
            showErrorMessage: true,
            allowBlank: true,
        };
    } else if (dataValidation === 'integer') {
        inputCell.dataValidation = {
            type: 'whole',
            operator: 'greaterThan',
            formulae: [0],
            error: validationStrings.integerError,
            errorTitle: validationStrings.errorTitle,
            showErrorMessage: true,
            allowBlank: true,
        };
    } else if (dataValidation === 'date') {
        inputCell.dataValidation = {
            type: 'date',
            operator: 'greaterThan',
            formulae: ['1970-1-1'],
            error: validationStrings.dateError,
            errorTitle: validationStrings.errorTitle,
            showErrorMessage: true,
            allowBlank: true,
        };
    } else if (dataValidation === 'list'
        && isDefined(optionKey)
        && isDefined(optionsWorksheet)
    ) {
        const optionsColumn = optionsWorksheet.getColumnKey(optionKey);

        if (optionsColumn) {
            const colLetter = optionsColumn.letter;
            const numOptions = optionsColumn.values.length;

            const formulae = `=${optionsWorksheet.name}!$${colLetter}$2:$${colLetter}$${numOptions}`;

            inputCell.dataValidation = {
                type: 'list',
                formulae: [formulae],
                error: validationStrings.listError,
                errorTitle: validationStrings.errorTitle,
                showErrorMessage: true,
                allowBlank: true,
            };
        }
    }

    return row;
}

async function generateCoverWorksheet(
    coverWorksheet: Worksheet,
    workbook: Workbook,
    typeOfDref: TypeOfDrefEnum,
    coverStrings: CoverStrings,
) {
    const isImminent = typeOfDref === DREF_TYPE_IMMINENT;

    function writeCellRange(
        row: string,
        col: string,
        value: string,
    ) {
        // eslint-disable-next-line no-param-reassign
        coverWorksheet.getCell(row).value = parsePseudoHtml(value);
        coverWorksheet.mergeCells(`${row}:${col}`);
        return coverWorksheet.getCell(`${row}:${col}`);
    }

    function selectRange(sheet: Worksheet, startCell: string, endCell: string) {
        const [endCellColumn, endRow] = endCell.split(':', 2);
        const [startCellColumn, startRow] = startCell.split(':', 2);

        const endColumn = sheet.getColumn(endCellColumn!);
        const startColumn = sheet.getColumn(startCellColumn!);

        const startColumnNum = startColumn.number;
        const endColumnNum = endColumn.number;

        const cells = [];
        for (let y = Number(startRow); y <= Number(endRow); y += 1) {
            const row = sheet.getRow(y);

            for (let x = startColumnNum; x <= endColumnNum; x += 1) {
                cells.push(row.getCell(x));
            }
        }

        return cells;
    }

    const response = await fetch(ifrcLogoFile);
    const buffer = await response.arrayBuffer();
    const ifrcLogo = workbook.addImage({
        buffer,
        extension: 'png',
    });
    coverWorksheet.addImage(ifrcLogo, 'A1:B6');

    const introH1Style: Partial<Style> = {
        font: {
            name: FONT_FAMILY_HEADER,
            family: 2,
            bold: true,
            // FIXME: use constant
            size: 20,
            color: { argb: hexToArgb(COLOR_PRIMARY_RED) },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    const introH2Style: Partial<Style> = {
        font: {
            bold: true,
            // FIXME: use constant
            size: 16,
            name: FONT_FAMILY_HEADER,
            family: 2,
            color: { argb: hexToArgb(COLOR_PRIMARY_BLUE) },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    const introH3Style: Partial<Style> = {
        font: {
            bold: true,
            // FIXME: use constant
            size: 11,
            name: FONT_FAMILY_HEADER,
            family: 2,
            color: { argb: hexToArgb(COLOR_PRIMARY_RED) },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    const introDescriptionStyle: Partial<Style> = {
        font: {
            // FIXME: use constant
            size: 11,
            // FIXME: use constant
            name: 'Poppins',
            family: 2,
        },
        alignment: { wrapText: true, vertical: 'middle' },
    };

    const heading = writeCellRange('C1', 'L3', coverStrings.heading);
    heading.style = introH1Style;

    const subHeading = writeCellRange('C4', 'L6', coverStrings.subHeading);
    subHeading.style = introH2Style;

    const overviewHeading = writeCellRange('C11', 'L11', coverStrings.overviewHeading);
    overviewHeading.style = introH3Style;

    const overviewDescription = writeCellRange('C12', 'L18', coverStrings.overviewDescription);
    overviewDescription.style = introDescriptionStyle;

    const eligibilityCriteriaHeading = writeCellRange('C21', 'L21', coverStrings.eligibilityHeading);
    eligibilityCriteriaHeading.style = introH3Style;

    const eligibilityCriteriaDescription = writeCellRange('C22', 'L33', isImminent
        ? coverStrings.eligibilityImminent
        : coverStrings.eligibilityResponse);
    eligibilityCriteriaDescription.style = introDescriptionStyle;

    const note = writeCellRange('C36', 'L40', isImminent
        ? coverStrings.noteImminent
        : coverStrings.noteResponse);
    note.style = introDescriptionStyle;

    const howToUseHeading = writeCellRange('P11', 'Y11', coverStrings.howToUseHeading);
    howToUseHeading.style = introH3Style;

    const howToUseDescription = writeCellRange('P12', 'Y24', coverStrings.howToUseDescription);
    howToUseDescription.style = introDescriptionStyle;

    const structureOfTemplateHeading = writeCellRange('P27', 'Y27', coverStrings.structureHeading);
    structureOfTemplateHeading.style = introH3Style;

    const structureOfTemplateDescription = writeCellRange('P28', 'Y36', isImminent
        ? coverStrings.structureImminent
        : coverStrings.structureResponse);
    structureOfTemplateDescription.style = introDescriptionStyle;

    const stepsForImportingHeading = writeCellRange('P39', 'Y39', coverStrings.stepsHeading);
    stepsForImportingHeading.style = introH3Style;

    const stepsForImportingDescription = writeCellRange('P40', 'Y46', coverStrings.stepsDescription);
    stepsForImportingDescription.style = introDescriptionStyle;

    const cells = selectRange(coverWorksheet, 'A:1', 'Z:48');
    cells.forEach((cell) => {
        // eslint-disable-next-line no-param-reassign
        cell.border = {
            // FIXME: use constant
            bottom: { style: 'thin', color: { argb: hexToArgb('#ffffff', '10') } },
            // FIXME: use constant
            top: { style: 'thin', color: { argb: hexToArgb('#ffffff', '10') } },
            // FIXME: use constant
            left: { style: 'thin', color: { argb: hexToArgb('#ffffff', '10') } },
            // FIXME: use constant
            right: { style: 'thin', color: { argb: hexToArgb('#ffffff', '10') } },
        };
    });
}

async function generateOtherWorksheets(
    templateActions: TemplateField[],
    optionsWorksheet: Worksheet,
    workbook: Workbook,
    validationStrings: ValidationStrings,
) {
    const fieldNameToTabNameMap: Record<string, string> = {
        ...listToMap(
            overviewTabFields,
            (key) => key as string,
            () => SHEET_OPERATION_OVERVIEW,
        ),
        ...listToMap(
            eventDetailTabFields,
            (key) => key as string,
            () => SHEET_EVENT_DETAIL,
        ),
        ...listToMap(
            actionsTabFields,
            (key) => key as string,
            () => SHEET_ACTIONS_NEEDS,
        ),
        ...listToMap(
            operationTabFields,
            (key) => key as string,
            () => SHEET_OPERATION,
        ),
        ...listToMap(
            timeframeAndContactsTabFields,
            (key) => key as string,
            () => SHEET_TIMEFRAMES_AND_CONTACTS,
        ),
    };

    const tabGroupedTemplateActions = mapToList(
        listToGroupList(
            templateActions,
            (templateAction) => {
                // FIXME: We should instead use a helper function to get the fieldName
                const fieldName = String(templateAction.name).split('__')[0]!;
                return fieldNameToTabNameMap[fieldName]!;
            },
        ),
        (actions, tabName) => {
            const worksheet = workbook.getWorksheet(tabName);
            if (isNotDefined(worksheet)) {
                return undefined;
            }

            return {
                worksheet,
                tabName,
                actions,
            };
        },
    ).filter(isDefined);

    const ROW_OFFSET = 2;
    tabGroupedTemplateActions.forEach(({ actions, worksheet }) => {
        let lastHeadingIndex = 0;
        actions.forEach((templateAction, i) => {
            const row = i + ROW_OFFSET;

            if (templateAction.type === 'heading') {
                addHeadingRow(
                    worksheet,
                    row,
                    templateAction.outlineLevel,
                    String(templateAction.name),
                    templateAction.label,
                    templateAction.description,
                );
                worksheet.mergeCells(row, 1, row, 3);
                lastHeadingIndex = i + 1;
            } else if (templateAction.type === 'input') {
                const rowType = (i - lastHeadingIndex) % 2 === 0 ? 'alt' : 'normal';
                if (templateAction.dataValidation === 'list') {
                    addInputRow(
                        validationStrings,
                        rowType,
                        worksheet,
                        row,
                        templateAction.outlineLevel,
                        String(templateAction.name),
                        templateAction.label,
                        templateAction.description,
                        'list',
                        String(templateAction.optionsKey),
                        optionsWorksheet,
                    );
                } else if (templateAction.dataValidation === 'textArea') {
                    // NOTE: Adding 4 new-lines to add height while also
                    // supporting expand
                    const newLines = '\n\n';
                    let { label } = templateAction;
                    if (typeof label === 'string' && isTruthyString(label)) {
                        label = newLines + label + newLines;
                    } else if (typeof label === 'object' && label.richText.length > 0) {
                        label = {
                            ...label,
                            richText: [
                                { text: newLines },
                                ...label.richText,
                                { text: newLines },
                            ],
                        };
                    }

                    addInputRow(
                        validationStrings,
                        rowType,
                        worksheet,
                        row,
                        templateAction.outlineLevel,
                        String(templateAction.name),
                        label,
                        templateAction.description,
                        'text',
                    );
                } else {
                    addInputRow(
                        validationStrings,
                        rowType,
                        worksheet,
                        row,
                        templateAction.outlineLevel,
                        String(templateAction.name),
                        templateAction.label,
                        templateAction.description,
                        templateAction.dataValidation,
                    );
                }
            }
        });
    });
}

async function generateOptionsWorksheet(
    optionsWorksheet: Worksheet,
    optionsMap: OptionsMapping,
    typeOfDref: TypeOfDrefEnum,
) {
    // eslint-disable-next-line no-param-reassign
    optionsWorksheet.state = 'veryHidden';
    const optionKeys = Object.keys(optionsMap) as (keyof OptionsMapping)[];
    // eslint-disable-next-line no-param-reassign
    optionsWorksheet.columns = optionKeys.map((key) => (
        { header: key, key }
    ));

    optionKeys.forEach((key) => {
        const options = optionsMap[key];

        if (isDefined(options)) {
            const column = optionsWorksheet.getColumnKey(key);

            options.forEach((option, i) => {
                const cell = optionsWorksheet.getCell(i + 2, column.number);
                cell.name = getCombinedKey(option.key, key);
                cell.value = option.label;
            });
        }
    });

    // Embed the DREF type far beyond the option columns so it can't collide;
    // the import reads it back to pick the schema.
    const typeCell = optionsWorksheet.getCell(DREF_TYPE_CELL_ROW, DREF_TYPE_CELL_COLUMN);
    typeCell.value = typeOfDref;
}

// eslint-disable-next-line import/prefer-default-export
export async function generateTemplate(
    templateActions: TemplateField[],
    optionsMap: OptionsMapping,

    // FIXME: we should be able to remove these.
    drefTypeLabelMap: Record<TypeOfDrefEnum, string> | undefined,
    typeOfDref: TypeOfDrefEnum,

    templateStrings: TemplateStrings,

    callback: () => void,
) {
    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const coverWorksheet = workbook.addWorksheet(
        templateStrings.coverTabName,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );

    // Only create this type's sheets; generateOtherWorksheets drops fields whose
    // target sheet doesn't exist.
    const sheetMap: Partial<Record<DrefSheetName, xlsx.Worksheet>> = {};
    getDrefSheetNames(typeOfDref).forEach((sheetName) => {
        sheetMap[sheetName] = workbook.addWorksheet(
            sheetName,
            { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
        );
    });

    const optionsWorksheet = workbook.addWorksheet(DREF_OPTIONS_SHEET_NAME);

    await generateCoverWorksheet(coverWorksheet, workbook, typeOfDref, templateStrings.cover);

    await generateOptionsWorksheet(optionsWorksheet, optionsMap, typeOfDref);

    await generateOtherWorksheets(
        templateActions,
        optionsWorksheet,
        workbook,
        {
            numberError: templateStrings.validationNumberError,
            integerError: templateStrings.validationIntegerError,
            dateError: templateStrings.validationDateError,
            listError: templateStrings.validationListError,
            errorTitle: templateStrings.validationErrorTitle,
        },
    );

    Object.values(sheetMap).forEach(
        (sheet) => {
            if (isNotDefined(sheet)) {
                return;
            }
            const worksheet = sheet;
            worksheet.properties.defaultRowHeight = 30;
            worksheet.properties.showGridLines = false;

            worksheet.columns = [
                {
                    key: 'field',
                    header: templateStrings.columnFieldHeader,
                    protection: { locked: true },
                    width: 50,
                    style: { alignment: { wrapText: true } },
                },
                {
                    key: 'value',
                    header: templateStrings.columnValueHeader,
                    width: 85,
                    style: { alignment: { wrapText: true } },
                },
                {
                    key: 'description',
                    header: templateStrings.columnDescriptionHeader,
                    width: 80,
                },
            ];

            worksheet.getRow(1).eachCell(
                (cell) => {
                    // eslint-disable-next-line no-param-reassign
                    cell.style = {
                        font: {
                            name: FONT_FAMILY_HEADER,
                            color: { argb: hexToArgb(COLOR_WHITE, '10') },
                            // FIXME: use constant
                            size: 14,
                            bold: true,
                        },
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') },
                        },
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'center',
                        },
                    };
                },
            );
        },
    );

    const typeOfDrefLabel = drefTypeLabelMap?.[typeOfDref ?? DREF_TYPE_RESPONSE] ?? '';
    const templateFileName = `DREF_Application_${typeOfDrefLabel}_import_template_${now.toLocaleString()}.xlsx`;

    await workbook.xlsx.writeBuffer().then(
        (sheet) => {
            FileSaver.saveAs(
                new Blob([sheet], { type: 'application/vnd.ms-excel;charset=utf-8' }),
                templateFileName.replace(' ', '_'),
            );
        },
    );

    callback();
}
