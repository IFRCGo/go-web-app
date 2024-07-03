import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import xlsx, {
    type Border,
    type Row,
    type Style,
    type Workbook,
    type Worksheet,
} from 'exceljs';

import ifrcLogoFile from '#assets/icons/ifrc-square.png';
import {
    COLOR_DARK_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
} from '#utils/constants';

function hexToArgb(hexStr: string, alphaStr = 'ff') {
    const hexWithoutHash = hexStr.substring(1, hexStr.length);

    return `${alphaStr}${hexWithoutHash}`;
}

export const headerRowStyle: Partial<Style> = {
    font: {
        name: 'Montserrat',
        bold: true,
    },
    fill: {
        type: 'pattern',
        pattern: 'lightVertical',
        fgColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') },
    },
    alignment: {
        vertical: 'middle',
        horizontal: 'center',
    },
};

const headingStyle: Partial<Style> = {
    font: {
        name: 'Montserrat',
        color: { argb: hexToArgb(COLOR_PRIMARY_BLUE) },
    },
    alignment: {
        horizontal: 'left',
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

const inputBorderStyle: Partial<Border> = {
    style: 'dashed',
    color: { argb: hexToArgb(COLOR_PRIMARY_BLUE) },
};

const inputCellStyle: Partial<Style> = {
    fill: {
        type: 'pattern',
        pattern: 'lightVertical',
        fgColor: { argb: hexToArgb(COLOR_DARK_GREY, '10') },
    },
    border: {
        top: inputBorderStyle,
        left: inputBorderStyle,
        right: inputBorderStyle,
        bottom: inputBorderStyle,
    },
    alignment: {
        vertical: 'top',
        wrapText: true,
    },
};

export async function buildCoverWorksheet(
    coverWorksheet: Worksheet,
    workbook: Workbook,
    typeOfDrefLabel: string,
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
            name: 'Montserrat',
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
            bold: true, size: 18, name: 'Montserrat', family: 2,
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    coverWorksheet.mergeCells('A7:L8');
    const descriptionCell = coverWorksheet.getCell('A7');
    descriptionCell.value = 'You can use this excel to fill up DREF application form and import it through the New Dref Application page in the GO. The fields are divided into 5 different sheets similar to the form in GO application.';
    descriptionCell.style.alignment = {
        wrapText: true,
    };

    coverWorksheet.mergeCells('A10:E10');
    const typeCell = coverWorksheet.getCell('A10');
    typeCell.value = `Type of DREF Application: ${typeOfDrefLabel}`;
}

export function addRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    style?: Partial<xlsx.Style>,
) {
    const col = 1;

    const row = sheet.getRow(rowNum);

    row.getCell(col).name = name;
    row.getCell(col + 1).name = name;

    row.getCell(col).value = label;
    row.outlineLevel = outlineLevel;

    if (style) {
        row.getCell(col).style = style;
    } else {
        row.getCell(col).style = defaultCellStyle;
    }

    const prevStyle = row.getCell(col).style;
    row.getCell(col).style = {
        ...prevStyle,
        alignment: {
            ...prevStyle?.alignment,
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
) {
    return addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
        headingStyle,
    );
}

export function addInputRow(
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    dataValidation?: 'number' | 'integer' | 'date',
    description?: string,
): Row
export function addInputRow(
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    dataValidation: 'list',
    optionKey: string,
    optionsWorksheet: Worksheet,
    description?: string,
): Row
export function addInputRow(
    sheet: Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    dataValidation?: 'number' | 'integer' | 'date' | 'list',
    optionKey?: string,
    optionsWorksheet?: Worksheet,
    description?: string,
): Row {
    const col = 1;

    const row = addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
    );

    const inputCell = row.getCell(col + 1);
    inputCell.style = inputCellStyle;

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

    if (isTruthyString(description)) {
        const descriptionCell = row.getCell(col + 2);
        descriptionCell.value = description;
    }

    return row;
}
