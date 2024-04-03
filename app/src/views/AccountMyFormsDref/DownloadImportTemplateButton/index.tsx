import {
    useCallback,
    useState,
} from 'react';
import { Button } from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import xlsx from 'exceljs';
import FileSaver from 'file-saver';

import ifrcLogoFile from '#assets/icons/ifrc-square.png';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import {
    COLOR_DARK_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import {
    DrefSheetName,
    SHEET_ACTIONS_NEEDS,
    SHEET_EVENT_DETAIL,
    SHEET_OPERATION,
    SHEET_OPERATION_OVERVIEW,
    SHEET_TIMEFRAMES_AND_CONTACTS,
} from '#utils/domain/dref';
import {
    createImportTemplate,
    TemplateSchema,
} from '#utils/importTemplate';
import { DrefRequestBody } from '#views/DrefApplicationForm/schema';

function hexToArgb(hexStr: string, alphaStr = 'ff') {
    const hexWithoutHash = hexStr.substring(1, hexStr.length);

    return `${alphaStr}${hexWithoutHash}`;
}

const headerRowStyle: Partial<xlsx.Style> = {
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

const headingStyle: Partial<xlsx.Style> = {
    font: {
        name: 'Montserrat',
        color: { argb: hexToArgb(COLOR_PRIMARY_BLUE) },
    },
    alignment: {
        horizontal: 'left',
        vertical: 'middle',
    },
};

const defaultCellStyle: Partial<xlsx.Style> = {
    font: {
        name: 'Poppins',
    },
    alignment: {
        horizontal: 'left',
        vertical: 'top',
        wrapText: true,
    },
};

const inputBorderStyle: Partial<xlsx.Border> = {
    style: 'dashed',
    color: { argb: hexToArgb(COLOR_PRIMARY_BLUE) },
};

const inputCellStyle: Partial<xlsx.Style> = {
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

function addRow(
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

function addInputRow(
    sheet: xlsx.Worksheet,
    rowNum: number,
    outlineLevel: number,
    name: string,
    label: string,
    optionKey?: string,
    optionsWorksheet?: xlsx.Worksheet,
    style?: Partial<xlsx.Style>,
) {
    const col = 1;

    const row = addRow(
        sheet,
        rowNum,
        outlineLevel,
        name,
        label,
        style,
    );

    const inputCell = row.getCell(col + 1);
    inputCell.style = inputCellStyle;

    if (isDefined(optionKey) && isDefined(optionsWorksheet)) {
        const optionsColumn = optionsWorksheet.getColumnKey(optionKey);

        if (optionsColumn) {
            const colLetter = optionsColumn.letter;
            const numOptions = optionsColumn.values.length;

            const formulae = `=${optionsWorksheet.name}!$${colLetter}$2:$${colLetter}$${numOptions}`;

            inputCell.dataValidation = {
                type: 'list',
                formulae: [formulae],
            };
        }
    }

    return row;
}

function DownloadImportTemplateButton() {
    const [generationPending, setGenerationPending] = useState(false);

    const nationalSocieties = useNationalSociety();
    const countries = useCountry();
    const disasterTypes = useDisasterTypes();

    const {
        dref_planned_intervention_title,
        dref_national_society_action_title,
        dref_identified_need_title,
        dref_dref_onset_type,
        dref_dref_disaster_category,
    } = useGlobalEnums();

    const handleClick = useCallback(
        () => {
            const optionsMap = {
                __boolean: [
                    {
                        key: true,
                        label: 'Yes',
                    },
                    {
                        key: false,
                        label: 'No',
                    },
                ],
                national_society: nationalSocieties.map(
                    ({ id, society_name }) => ({ key: id, label: society_name }),
                ),
                country: countries.map(
                    ({ id, name }) => ({ key: id, label: name }),
                ),
                disaster_type: disasterTypes?.map(
                    ({ id, name }) => ({ key: id, label: name }),
                ) ?? [],
                type_of_onset: dref_dref_onset_type?.map(
                    ({ key, value }) => ({ key, label: value }),
                ) ?? [],
                disaster_category: dref_dref_disaster_category?.map(
                    ({ key, value }) => ({ key, label: value }),
                ) ?? [],
                planned_interventions: dref_planned_intervention_title?.map(
                    ({ key, value }) => ({ key, label: value }),
                ) ?? [],
                planned_interventions__indicators: [
                    { key: 'indicator__0', label: 'Indicator #1' },
                    { key: 'indicator__1', label: 'Indicator #2' },
                    { key: 'indicator__2', label: 'Indicator #3' },
                ],
                ns_actions: dref_national_society_action_title?.map(
                    ({ key, value }) => ({ key, label: value }),
                ) ?? [],
                identified_needs: dref_identified_need_title?.map(
                    ({ key, value }) => ({ key, label: value }),
                ) ?? [],
            };

            const drefFormSchema: TemplateSchema<DrefRequestBody, typeof optionsMap> = {
                type: 'object',
                fields: {
                    national_society: {
                        type: 'select',
                        label: 'National society',
                        validation: 'number',
                        optionsKey: 'national_society',
                    },

                    // We're skipping type of DREF since we'll have separate
                    // template for each type of dref
                    // type_of_dref: xxx

                    disaster_type: {
                        type: 'select',
                        label: 'Type of disaster',
                        validation: 'number',
                        optionsKey: 'disaster_type',
                    },

                    // type_of_onset:
                    // disaster_category:

                    country: {
                        type: 'select',
                        label: 'Country',
                        validation: 'number',
                        optionsKey: 'country',
                    },

                    title: {
                        type: 'input',
                        label: 'DREF Title',
                        validation: 'string',
                    },

                    emergency_appeal_planned: {
                        type: 'select',
                        label: 'Emergency appeal planned',
                        optionsKey: '__boolean',
                        validation: 'boolean',
                    },

                    did_it_affect_same_population: {
                        type: 'select',
                        label: 'Has a similar event affected the same area(s) in the last 3 years?',
                        optionsKey: '__boolean',
                        validation: 'boolean',
                    },

                    planned_interventions: {
                        type: 'list',
                        label: 'Planned interventions',
                        optionsKey: 'planned_interventions',
                        children: {
                            type: 'object',
                            fields: {
                                budget: {
                                    type: 'input',
                                    validation: 'number',
                                    label: 'Budget',
                                },
                                person_targeted: {
                                    type: 'input',
                                    validation: 'number',
                                    label: 'Person targeted',
                                },
                                description: {
                                    type: 'input',
                                    validation: 'string',
                                    label: 'Description',
                                },
                                indicators: {
                                    type: 'list',
                                    label: 'Indicators',
                                    optionsKey: 'planned_interventions__indicators',
                                    children: {
                                        type: 'object',
                                        fields: {
                                            title: {
                                                type: 'input',
                                                validation: 'string',
                                                label: 'Title',
                                            },
                                            target: {
                                                type: 'input',
                                                validation: 'number',
                                                label: 'Target',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            const templateActions = createImportTemplate(drefFormSchema, optionsMap);

            async function generateTemplate() {
                const workbook = new xlsx.Workbook();
                const now = new Date();
                workbook.created = now;
                // workbook.description = JSON.stringify(drefFormSchema);

                const response = await fetch(ifrcLogoFile);
                const buffer = await response.arrayBuffer();

                const ifrcLogo = workbook.addImage({
                    buffer,
                    extension: 'png',
                });

                const coverWorksheet = workbook.addWorksheet('DREF Import');

                const overviewWorksheet = workbook.addWorksheet(SHEET_OPERATION_OVERVIEW);
                const eventDetailsWorksheet = workbook.addWorksheet(SHEET_EVENT_DETAIL);
                const actionsNeedsWorksheet = workbook.addWorksheet(SHEET_ACTIONS_NEEDS);
                const operationWorksheet = workbook.addWorksheet(SHEET_OPERATION);
                const timeframeAndContactsWorksheet = workbook.addWorksheet(
                    SHEET_TIMEFRAMES_AND_CONTACTS,
                );

                const sheetMap: Record<DrefSheetName, xlsx.Worksheet> = {
                    [SHEET_OPERATION_OVERVIEW]: overviewWorksheet,
                    [SHEET_EVENT_DETAIL]: eventDetailsWorksheet,
                    [SHEET_ACTIONS_NEEDS]: actionsNeedsWorksheet,
                    [SHEET_OPERATION]: operationWorksheet,
                    [SHEET_TIMEFRAMES_AND_CONTACTS]: timeframeAndContactsWorksheet,
                };

                const optionsWorksheet = workbook.addWorksheet('options');
                optionsWorksheet.state = 'veryHidden';
                const optionKeys = Object.keys(optionsMap) as (keyof (typeof optionsMap))[];

                optionsWorksheet.columns = optionKeys.map((key) => (
                    { header: key, key }
                ));

                optionKeys.forEach((key) => {
                    const options = optionsMap[key];

                    if (isDefined(options)) {
                        const column = optionsWorksheet.getColumnKey(key);

                        options.forEach((option, i) => {
                            const cell = optionsWorksheet.getCell(i + 2, column.number);
                            cell.name = String(option.key);
                            cell.value = option.label;
                        });
                    }
                });

                coverWorksheet.addImage(ifrcLogo, 'A1:B6');
                coverWorksheet.getCell('C1').value = 'DISASTER RESPONSE EMERGENCY FUND';
                coverWorksheet.mergeCells('C1:L3');
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
                coverWorksheet.getCell('C4').value = 'Import template';
                coverWorksheet.getCell('C4').style = {
                    font: {
                        bold: true, size: 18, name: 'Montserrat', family: 2,
                    },
                    alignment: { horizontal: 'center', vertical: 'middle' },
                };

                const rowOffset = 2;

                templateActions.forEach((templateAction, i) => {
                    if (templateAction.type === 'heading') {
                        addRow(
                            overviewWorksheet,
                            i + rowOffset,
                            templateAction.outlineLevel,
                            String(templateAction.name),
                            templateAction.label,
                            {
                                ...headingStyle,
                                font: {
                                    ...headingStyle.font,
                                },
                            },
                        );
                    } else if (templateAction.type === 'input') {
                        if (templateAction.dataValidation === 'list') {
                            addInputRow(
                                overviewWorksheet,
                                i + rowOffset,
                                templateAction.outlineLevel,
                                String(templateAction.name),
                                templateAction.label,
                                String(templateAction.optionsKey),
                                optionsWorksheet,
                            );
                        } else {
                            addInputRow(
                                overviewWorksheet,
                                i + rowOffset,
                                templateAction.outlineLevel,
                                String(templateAction.name),
                                templateAction.label,
                            );
                        }
                    }
                });

                Object.values(sheetMap).forEach(
                    (sheet) => {
                        const worksheet = sheet;
                        worksheet.properties.defaultRowHeight = 20;
                        worksheet.properties.showGridLines = false;

                        worksheet.columns = [
                            {
                                key: 'field',
                                header: 'Field',
                                protection: { locked: true },
                                width: 50,
                            },
                            {
                                key: 'value',
                                header: 'Value',
                                width: 50,
                            },
                        ];

                        worksheet.getRow(1).eachCell(
                            (cell) => {
                                // eslint-disable-next-line no-param-reassign
                                cell.style = headerRowStyle;
                            },
                        );
                    },
                );

                await workbook.xlsx.writeBuffer().then(
                    (sheet) => {
                        FileSaver.saveAs(
                            new Blob([sheet], { type: 'application/vnd.ms-excel;charset=utf-8' }),
                            `DREF import template ${now.toLocaleString()}.xlsx`,
                        );
                    },
                );

                setGenerationPending(false);
            }

            setGenerationPending((alreadyGenerating) => {
                if (!alreadyGenerating) {
                    generateTemplate();
                }

                return true;
            });
        },
        [
            countries,
            disasterTypes,
            nationalSocieties,
            dref_planned_intervention_title,
            dref_national_society_action_title,
            dref_identified_need_title,
            dref_dref_onset_type,
            dref_dref_disaster_category,
        ],
    );

    return (
        <Button
            onClick={handleClick}
            name={undefined}
            disabled={generationPending
                || isNotDefined(nationalSocieties)
                || isNotDefined(countries)
                || isNotDefined(disasterTypes)}
        >
            Download Import Template
        </Button>
    );
}

export default DownloadImportTemplateButton;
