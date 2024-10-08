import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import xlsx, {
    type Row,
    type Style,
    type Workbook,
    type Worksheet,
} from 'exceljs';

import ifrcLogoFile from '#assets/icons/ifrc-square.png';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
    FONT_FAMILY_HEADER,
} from '#utils/constants';

export function hexToArgb(hexStr: string, alphaStr = 'ff') {
    const hexWithoutHash = hexStr.substring(1);

    return `${alphaStr}${hexWithoutHash}`;
}

export const headerRowStyle: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
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

const headingStyle: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
        color: { argb: hexToArgb(COLOR_WHITE, '10') },
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

const subHeadingStyle: Partial<Style> = {
    font: {
        name: FONT_FAMILY_HEADER,
        color: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') },
    },
    alignment: {
        horizontal: 'center',
        vertical: 'middle',
    },
};

const defaultCellStyle: Partial<Style> = {
    font: {
        name: 'Poppins',
    },
    alignment: {
        horizontal: 'left',
        vertical: 'top',
        wrapText: true,
    },
};

const alternateRowFill: Style['fill'] = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexToArgb(COLOR_LIGHT_GREY, '10') },
};

export async function buildCoverWorksheetForDrefApplication(
    coverWorksheet: Worksheet,
    workbook: Workbook,
) {
    const response = await fetch(ifrcLogoFile);
    const buffer = await response.arrayBuffer();

    const ifrcLogo = workbook.addImage({
        buffer,
        extension: 'png',
    });

    coverWorksheet.addImage(ifrcLogo, 'A1:B6');
    // eslint-disable-next-line no-param-reassign
    coverWorksheet.getCell('C1').value = 'DISASTER RESPONSE EMERGENCY FUND';
    coverWorksheet.mergeCells('C1:L3');
    // eslint-disable-next-line no-param-reassign
    coverWorksheet.getCell('C1:L3').style = {
        font: {
            name: FONT_FAMILY_HEADER,
            family: 2,
            bold: true,
            size: 20,
            color: { argb: hexToArgb(COLOR_PRIMARY_RED) },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    coverWorksheet.addRow('');
    coverWorksheet.addRow('');
    coverWorksheet.addRow('');
    coverWorksheet.addRow('');
    coverWorksheet.mergeCells('C4:L6');
    // eslint-disable-next-line no-param-reassign
    coverWorksheet.getCell('C4').value = 'Import template';
    // eslint-disable-next-line no-param-reassign
    coverWorksheet.getCell('C4').style = {
        font: {
            bold: true,
            size: 18,
            name: FONT_FAMILY_HEADER,
            family: 2,
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    coverWorksheet.mergeCells('A7:L28');
    const descriptionCell = coverWorksheet.getCell('A7');
    descriptionCell.value = 'This template allows you to fill in the necessary section of a DREF request, to be imported in the GO platform to generate a DREF application form. An import can only be done once, so once done please continue working on the application in the GO platform. \n \n This excel has determined fields where the information needs to be completed, these fields are always in the column “Value”, please do not add any information outside of these fields. \n \n This Excel (.xlsx) can be uploaded to OneDrive or SharePoint and be worked on simultaneously by multiple users, but bear in mind that only one user can edit an specific cell at the time. \n \n Fields such as sources of information, risk and mitigation section and indicators where you can add several entries in the online form, have only 5 slots in this format, please do not try to create more, and limit your entries to 5. \n \n Once ready to import, please create a “New DREF Application” in the GO platform (log in require), and then select “Import” bottom';
    descriptionCell.style = {
        alignment: {
            wrapText: true,
            vertical: 'middle',
        },
        font: {
            size: 12,
            name: FONT_FAMILY_HEADER,
            family: 2,
        },
    };
}

export function addRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description?: string,
    style: Partial<xlsx.Style> = defaultCellStyle,
) {
    const col = 1;

    const row = sheet.getRow(rowNum);
    row.outlineLevel = outlineLevel;

    const labelCell = row.getCell(col);
    const valueCell = row.getCell(col + 1);
    const descriptionCell = row.getCell(col + 2);
    descriptionCell.style = defaultCellStyle;

    labelCell.name = name;
    valueCell.name = name;

    labelCell.value = label;
    if (isTruthyString(description)) {
        descriptionCell.value = description;
    }

    row.getCell(col).style = {
        ...style,
        alignment: {
            ...style?.alignment,
            indent: outlineLevel * 2,
        },
    };

    return row;
}

export function addHeadingRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description?: string,
) {
    return addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
        description,
        outlineLevel === 0 ? headingStyle : subHeadingStyle,
    );
}

export function addInputRow(
    headingType: 'heading' | 'listHeading',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description: string | undefined,
    dataValidation?: 'number' | 'integer' | 'date' | 'text',
): Row
export function addInputRow(
    headingType: 'heading' | 'listHeading',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description: string | undefined,
    dataValidation?: 'list',
    optionKey?: string,
    optionsWorksheet?: Worksheet,
): Row
export function addInputRow(
    headingType: 'heading' | 'listHeading',
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    description?: string,
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

    if (headingType === 'listHeading') {
        const firstCell = row.getCell(col);
        firstCell.style = {
            ...firstCell.style,
            fill: {
                ...firstCell.style?.fill,
                ...alternateRowFill,
            },
        };
        const secondCell = row.getCell(col + 1);
        secondCell.style = {
            ...secondCell.style,
            fill: {
                ...secondCell.style?.fill,
                ...alternateRowFill,
            },
        };
        const thirdCell = row.getCell(col + 2);
        thirdCell.style = {
            ...thirdCell.style,
            fill: {
                ...thirdCell.style?.fill,
                ...alternateRowFill,
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
