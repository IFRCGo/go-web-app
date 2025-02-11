import { isDefined } from '@togglecorp/fujs';
import xlsx from 'exceljs';
import FileSaver from 'file-saver';

import ifrcLogo from '#assets/icons/ifrc-square.png';
import { FONT_FAMILY_HEADER } from '#utils/constants';

interface ExportData {
    allocationFor: string;
    appealManager: string | null | undefined;
    projectManager: string | null | undefined;
    affectedCountry: string | null | undefined;
    name: string | null | undefined;
    disasterType: string | null | undefined;
    responseType: string | null | undefined;
    noOfPeopleTargeted: number | null | undefined;
    nsRequestDate: string | null | undefined;
    disasterStartDate: string | null | undefined;
    implementationPeriod: string | null | undefined;
    allocationRequested: number | null | undefined;
    previousAllocation?: number | null | undefined;
    totalDREFAllocation: number | null | undefined;
    toBeAllocatedFrom: string | null | undefined;
    focalPointName: string | null | undefined;
}
const COLOR_RED = '00F5333F';
const COLOR_DARK_GREY = '00404040';
const COLOR_GREY = '00D9D9D9';
const COLOR_LIGHT_BLUE = '00DCE6F2';

// TODO: Add translations

// eslint-disable-next-line import/prefer-default-export
export async function exportDrefAllocation(exportData: ExportData) {
    const {
        allocationFor,
        appealManager,
        projectManager,
        affectedCountry,
        name,
        disasterType,
        responseType,
        noOfPeopleTargeted,
        nsRequestDate,
        disasterStartDate,
        implementationPeriod,
        allocationRequested,
        previousAllocation,
        totalDREFAllocation,
        toBeAllocatedFrom,
        focalPointName,
    } = exportData;

    const workbook = new xlsx.Workbook();
    workbook.created = new Date();

    const response = await fetch(ifrcLogo);
    const buffer = await response.arrayBuffer();

    const image = workbook.addImage({
        buffer,
        extension: 'png',
    });
    const worksheet = workbook.addWorksheet('DREF Allocation', {
        properties: {
            defaultRowHeight: 20,
        },
        pageSetup: {
            paperSize: 9,
            showGridLines: false,
            fitToPage: true,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.25,
                bottom: 0.25,
                header: 1,
                footer: 1,
            },
        },
    });

    const borderStyles: Partial<xlsx.Borders> = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };

    worksheet.addImage(image, 'A1:B6');
    worksheet.getCell('C1').value = 'DISASTER RESPONSE EMERGENCY FUND';
    worksheet.mergeCells('C1:L3');
    worksheet.getCell('C1:L3').style = {
        font: {
            name: FONT_FAMILY_HEADER,
            family: 2,
            bold: true,
            size: 20,
            color: { argb: COLOR_RED },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.mergeCells('C4:L6');
    worksheet.getCell('C4').value = 'Fund Income Allocation Request';
    worksheet.getCell('C4').style = {
        font: {
            bold: true,
            size: 18,
            name: FONT_FAMILY_HEADER,
            family: 2,
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.addRow('');
    worksheet.mergeCells('A1:B6');
    worksheet.mergeCells('A7:L7');
    worksheet.mergeCells('A8:L8');
    worksheet.getCell('A7').value = 'To Be Completed By The DREF Focal Point';
    worksheet.getCell('A7').style = {
        font: {
            bold: true,
            size: 14,
            name: FONT_FAMILY_HEADER,
            family: 2,
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getCell('A7').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A9').value = 'DREF Allocation is requested for';
    worksheet.getCell('A9').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('A9').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('G9').value = allocationFor;
    worksheet.getCell('G9').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.mergeCells('A9:F9');
    worksheet.mergeCells('G9:L9');
    worksheet.getCell('A10').value = 'Appeal Manager';
    worksheet.getCell('A10').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('G10').value = 'Project Manager';
    worksheet.getCell('G10').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(appealManager)) {
        worksheet.getCell('A11').value = appealManager;
    }
    if (isDefined(projectManager)) {
        worksheet.getCell('G11').value = projectManager;
    }
    worksheet.getCell('A10').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('G10').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A11').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('G11').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.mergeCells('A10:F10');
    worksheet.mergeCells('G10:L10');
    worksheet.mergeCells('A11:F11');
    worksheet.mergeCells('G11:L11');
    worksheet.mergeCells('A12:F12');
    worksheet.mergeCells('G12:L12');
    worksheet.getCell('A12').value = 'Country of Operation';
    worksheet.getCell('G12').value = 'Name of Operation (as published)';
    worksheet.getCell('A12').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('G12').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(affectedCountry)) {
        worksheet.getCell('A13').value = affectedCountry;
    }
    if (isDefined(name)) {
        worksheet.getCell('G13').value = name;
    }
    worksheet.getCell('A12').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('G12').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A13').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('G13').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.mergeCells('A13:F13');
    worksheet.mergeCells('G13:L13');
    worksheet.mergeCells('A14:L14');
    worksheet.getCell('A15').value = 'Disaster / Hazard Type';
    worksheet.getCell('G15').value = 'Response Type';
    worksheet.getCell('J15').value = 'IFRC Targeted Assistance';
    worksheet.getCell('A15').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('G15').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('J15').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(disasterType)) {
        worksheet.getCell('A16').value = disasterType;
    }
    if (isDefined(responseType)) {
        worksheet.getCell('G16').value = responseType;
    }
    if (isDefined(noOfPeopleTargeted)) {
        worksheet.getCell('J16').value = `${noOfPeopleTargeted} people`;
    }
    worksheet.getCell('A15').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('G15').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('J15').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A16').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('G16').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('J16').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.mergeCells('A15:F15');
    worksheet.mergeCells('G15:I15');
    worksheet.mergeCells('J15:L15');
    worksheet.mergeCells('A16:F16');
    worksheet.mergeCells('G16:I16');
    worksheet.mergeCells('J16:L16');
    worksheet.mergeCells('A17:L17');
    worksheet.addRow(['For Early Action Protocols']);
    worksheet.mergeCells('A18:L18');
    worksheet.getCell('A18').style = { font: { color: { argb: '002E75B5' } } };
    worksheet.getCell('A19').value = 'Validation Committee Endorse Date';
    worksheet.getCell('E19').value = 'Early Action Protocol Reference';
    worksheet.getCell('I19').value = 'Operating Implementation Period';
    worksheet.getCell('A19').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('E19').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('I19').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('A19').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('E19').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('I19').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A20').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('E20').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('I20').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.mergeCells('A19:D19');
    worksheet.mergeCells('E19:H19');
    worksheet.mergeCells('I19:L19');
    worksheet.mergeCells('A20:D20');
    worksheet.mergeCells('E20:H20');
    worksheet.mergeCells('I20:L20');
    worksheet.mergeCells('A21:L21');
    worksheet.getCell('A22').value = 'For DREF Operations and Emergency Appeals';
    worksheet.getCell('A22').style = { font: { color: { argb: '002E75B5' } } };
    worksheet.mergeCells('A22:L22');
    worksheet.getCell('A23').value = 'National Society Request Date';
    worksheet.getCell('E23').value = 'Disaster Start or Trigger Date';
    worksheet.getCell('I23').value = 'Operating Implementation Period';
    worksheet.getCell('A23').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('E23').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('I23').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(nsRequestDate)) {
        worksheet.getCell('A24').value = nsRequestDate;
    }
    if (isDefined(disasterStartDate)) {
        worksheet.getCell('E24').value = disasterStartDate;
    }
    if (isDefined(implementationPeriod)) {
        worksheet.getCell('I24').value = implementationPeriod;
    }
    worksheet.getCell('A23').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('E23').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('I23').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A24').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('E24').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('I24').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.mergeCells('A23:D23');
    worksheet.mergeCells('E23:H23');
    worksheet.mergeCells('I23:L23');
    worksheet.mergeCells('A24:D24');
    worksheet.mergeCells('E24:H24');
    worksheet.mergeCells('I24:L24');
    worksheet.mergeCells('A25:L25');
    worksheet.getCell('A26').value = 'Allocation CHF';
    worksheet.mergeCells('A26:L26');
    worksheet.getCell('A26').style = { font: { color: { argb: '002E75B5' } } };
    worksheet.getCell('A27').value = 'DREF Allocation Request CHF';
    worksheet.getCell('E27').value = 'Previous Allocation(s) CHF';
    worksheet.getCell('I27').value = 'Total Allocation(s) CHF';
    worksheet.getCell('A27').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('E27').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('I27').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(allocationRequested)) {
        worksheet.getCell('A28').value = `CHF ${allocationRequested}`;
    }
    if (isDefined(previousAllocation)) {
        worksheet.getCell('E28').value = `CHF ${previousAllocation}`;
    }
    if (isDefined(totalDREFAllocation)) {
        worksheet.getCell('I28').value = `CHF ${totalDREFAllocation}`;
    }
    worksheet.getCell('A27').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('E27').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('I27').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A28').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('E28').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('I28').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.mergeCells('A27:D27');
    worksheet.mergeCells('E27:H27');
    worksheet.mergeCells('I27:L27');
    worksheet.mergeCells('A28:D28');
    worksheet.mergeCells('E28:H28');
    worksheet.mergeCells('I28:L28');
    worksheet.mergeCells('A29:E29');
    worksheet.mergeCells('F29:L29');
    worksheet.mergeCells('A30:L30');
    worksheet.getCell('A29').value = 'To be allocated from';
    worksheet.getCell('A29').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(toBeAllocatedFrom)) {
        worksheet.getCell('F29').value = toBeAllocatedFrom;
    }
    worksheet.getCell('A29').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('F29').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.getCell('A31').value = 'DREF Regional Focal Point Name';
    worksheet.getCell('I31').value = 'Signature';
    worksheet.getCell('F31').value = 'Date';
    worksheet.getCell('A31').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('I31').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('F31').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    if (isDefined(focalPointName)) {
        worksheet.getCell('A32').value = focalPointName;
    }
    worksheet.getCell('A31').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('I31').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('F31').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A32').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('I32').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('F32').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.addRow('');
    worksheet.mergeCells('A31:E31');
    worksheet.mergeCells('F31:H31');
    worksheet.mergeCells('I31:L31');
    worksheet.mergeCells('A32:E32');
    worksheet.mergeCells('F32:H32');
    worksheet.mergeCells('I32:L32');
    worksheet.mergeCells('A33:L33');
    worksheet.addRow(['To Be Completed By DREF Appeal Manger']);
    worksheet.mergeCells('A34:L34');
    worksheet.getCell('A34').style = {
        font: { bold: true, size: 14 },
        alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getCell('A34').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A35').value = 'I herewith approve the Early Action Protocol/DREF Application, Operating Budget and Allocation of Funds per amount indicated above. Where applicable, I also confirm that I have sought additional approval from USG National Society  Development and Operations Coordination (email herewith attached)';
    worksheet.getCell('A35').alignment = { wrapText: true };
    worksheet.mergeCells('A35:L37');
    worksheet.addRow('');
    worksheet.mergeCells('A38:L38');
    worksheet.addRow(['Comments']);
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.addRow('');
    worksheet.mergeCells('A39:L39');
    worksheet.getCell('A39').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('A39').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.mergeCells('A40:L42');
    worksheet.getCell('A40').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('A43').value = 'DREF Appeal Manager Name';
    worksheet.getCell('F43').value = 'Date';
    worksheet.getCell('I43').value = 'Signature';
    worksheet.getCell('A43').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('F43').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.getCell('I43').style = { font: { color: { argb: COLOR_DARK_GREY } } };
    worksheet.addRow('');
    worksheet.mergeCells('A43:E43');
    worksheet.mergeCells('F43:H43');
    worksheet.mergeCells('I43:L43');
    worksheet.mergeCells('A44:E44');
    worksheet.mergeCells('F44:H44');
    worksheet.mergeCells('I44:L44');
    worksheet.getCell('A43').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('F43').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('I43').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_GREY,
        },
    };
    worksheet.getCell('A44').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('I44').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };
    worksheet.getCell('F44').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: COLOR_LIGHT_BLUE,
        },
    };

    worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell({ includeEmpty: false }, (cell) => {
            cell.border = borderStyles; // eslint-disable-line no-param-reassign
            if (!cell.font?.size) {
                // eslint-disable-next-line no-param-reassign
                cell.font = Object.assign(cell.font || {}, { size: 12 });
            }
        });
    });

    await workbook.xlsx.writeBuffer().then((sheet) => FileSaver.saveAs(
        new Blob([sheet], { type: 'application/vnd.ms-excel;charset=utf-8' }),
        `${name} Allocation Form.xlsx`,
    ));
}
