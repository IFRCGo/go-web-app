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
    DREF_TYPE_RESPONSE,
    FONT_FAMILY_HEADER,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    type DrefSheetName,
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

import { type OptionsMapping } from './useImportTemplateSchema';

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
            error: 'Please enter a number greater than 0',
            errorTitle: 'Invalid value',
            showErrorMessage: true,
            allowBlank: true,
        };
    } else if (dataValidation === 'integer') {
        inputCell.dataValidation = {
            type: 'whole',
            operator: 'greaterThan',
            formulae: [0],
            error: 'Please enter an integer greater than 0',
            errorTitle: 'Invalid value',
            showErrorMessage: true,
            allowBlank: true,
        };
    } else if (dataValidation === 'date') {
        inputCell.dataValidation = {
            type: 'date',
            operator: 'greaterThan',
            formulae: ['1970-1-1'],
            error: 'Please enter a date',
            errorTitle: 'Invalid value',
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
                error: 'Please select a value from the list',
                errorTitle: 'Invalid value',
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
) {
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

        const endColumn = sheet.getColumn(endCellColumn);
        const startColumn = sheet.getColumn(startCellColumn);

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

    const heading = writeCellRange('C1', 'L3', 'DISASTER RESPONSE EMERGENCY FUND');
    heading.style = introH1Style;

    const subHeading = writeCellRange('C4', 'L6', '<b><i>Import template</i></b>');
    subHeading.style = introH2Style;

    const overviewHeading = writeCellRange('C11', 'L11', 'Overview');
    overviewHeading.style = introH3Style;

    const overviewDescription = writeCellRange('C12', 'L18', 'This template is designed to assist National Societies (NS) in submitting a Disaster Relief Emergency Fund (DREF) request. The completed template will be imported into the GO platform to generate the DREF application form. Please ensure that all required fields are completed correctly, as the import can only be done once. After importing, further edits should be made directly in the GO platform.');
    overviewDescription.style = introDescriptionStyle;

    const eligibilityCriteriaHeading = writeCellRange('C21', 'L21', 'Criteria and Eligibility');
    eligibilityCriteriaHeading.style = introH3Style;

    const eligibilityCriteriaDescription = writeCellRange('C22', 'L33', 'Before completing the template, ensure you meet the following criteria:\n\n--- A Field Report has been published to inform the DREF decision.\n--- NS has no overdue DREF reports.\n--- The support cost is no more than 40% (check under the “Resource Budget Summary” tab).\n--- The operation supports at least 100 households (HH).\n--- The budget allows no more than CHF100 per person (Total Budget ÷ Number of Targeted People).\n--- If requesting more than CHF500,000, check the IFRC categorisation with the Regional Office Information Management (RO IM) team (yellow category ceiling).');
    eligibilityCriteriaDescription.style = introDescriptionStyle;

    const note = writeCellRange('C36', 'L40', '<b>Ensure your DREF request reaches the Regional Office (RO) with enough time for a 24-hour technical review</b>, addressing comments, and getting approval within 10 days (sudden onset) or 14 days (slow onset/replenishment) from the trigger date.');
    note.style = introDescriptionStyle;

    const howToUseHeading = writeCellRange('P11', 'Y11', 'How to use the template');
    howToUseHeading.style = introH3Style;

    const howToUseDescription = writeCellRange('P12', 'Y24', '<b>Mandatory fields</b>\nInput required information in the “Value” column. Do not add data outside of these designated fields.\n\n<b>Collaboration</b>\nThis Excel file can be uploaded to OneDrive/SharePoint/Google Drive for multiple users to work on simultaneously. Please note that only one user can edit any specific cell at a time.\n\n<b>Entry limits</b>\nSome sections, like sources of information, risks and mitigation, and indicators, have a maximum of <b>5 entries</b>. Please do not attempt to add more.');
    howToUseDescription.style = introDescriptionStyle;

    const structureOfTemplateHeading = writeCellRange('P27', 'Y27', 'Structure of the template');
    structureOfTemplateHeading.style = introH3Style;

    const structureOfTemplateDescription = writeCellRange('P28', 'Y36', 'The template is divided into the following sections:\n\n<b><i>Operation Overview</i></b> – general context of the emergency operation.\n<b><i>Event Details</i></b> – information on the event triggering the DREF request.\n<b><i>Actions and Needs</i></b> – description of key actions and needs.\n<b><i>Operation Plan</i></b> – outline of the planned operation and identified risks.\n<b><i>Timeframes and Contacts</i></b> – key timeframes and relevant contact details.');
    structureOfTemplateDescription.style = introDescriptionStyle;

    const stepsForImportingHeading = writeCellRange('P39', 'Y39', 'Steps for importing the template');
    stepsForImportingHeading.style = introH3Style;

    const stepsForImportingDescription = writeCellRange('P40', 'Y46', '1. Ensure the template is fully completed and all fields are correctly filled.\n2. Log in to the GO platform.\n3. Create a “New DREF Application” and use the <b>Import</b> function to upload this Excel file.\n4. After importing, any additional work on the application should be done directly in the GO platform.');
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
                const fieldName = String(templateAction.name).split('__')[0];
                return fieldNameToTabNameMap[fieldName];
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
}

// eslint-disable-next-line import/prefer-default-export
export async function generateTemplate(
    templateActions: TemplateField[],
    optionsMap: OptionsMapping,

    // FIXME: we should be able to remove these.
    drefTypeLabelMap: Record<TypeOfDrefEnum, string> | undefined,
    typeOfDref: TypeOfDrefEnum,

    callback: () => void,
) {
    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const coverWorksheet = workbook.addWorksheet(
        'DREF Import',
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    const overviewWorksheet = workbook.addWorksheet(
        SHEET_OPERATION_OVERVIEW,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    const eventDetailsWorksheet = workbook.addWorksheet(
        SHEET_EVENT_DETAIL,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    const actionsNeedsWorksheet = workbook.addWorksheet(
        SHEET_ACTIONS_NEEDS,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    const operationWorksheet = workbook.addWorksheet(
        SHEET_OPERATION,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    const timeframeAndContactsWorksheet = workbook.addWorksheet(
        SHEET_TIMEFRAMES_AND_CONTACTS,
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );

    const optionsWorksheet = workbook.addWorksheet('options');

    await generateCoverWorksheet(coverWorksheet, workbook);

    await generateOptionsWorksheet(optionsWorksheet, optionsMap);

    await generateOtherWorksheets(
        templateActions,
        optionsWorksheet,
        workbook,
    );

    const sheetMap: Record<DrefSheetName, xlsx.Worksheet> = {
        [SHEET_OPERATION_OVERVIEW]: overviewWorksheet,
        [SHEET_EVENT_DETAIL]: eventDetailsWorksheet,
        [SHEET_ACTIONS_NEEDS]: actionsNeedsWorksheet,
        [SHEET_OPERATION]: operationWorksheet,
        [SHEET_TIMEFRAMES_AND_CONTACTS]: timeframeAndContactsWorksheet,
    };
    Object.values(sheetMap).forEach(
        (sheet) => {
            const worksheet = sheet;
            worksheet.properties.defaultRowHeight = 30;
            worksheet.properties.showGridLines = false;

            worksheet.columns = [
                {
                    key: 'field',
                    header: 'Field',
                    protection: { locked: true },
                    width: 50,
                    style: { alignment: { wrapText: true } },
                },
                {
                    key: 'value',
                    header: 'Value',
                    width: 85,
                    style: { alignment: { wrapText: true } },
                },
                {
                    key: 'description',
                    header: 'Description',
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
