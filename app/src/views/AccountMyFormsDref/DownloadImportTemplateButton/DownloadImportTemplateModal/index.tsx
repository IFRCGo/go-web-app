import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Modal,
    RadioInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import xlsx from 'exceljs';
import FileSaver from 'file-saver';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    COLOR_PRIMARY_RED,
    DREF_TYPE_RESPONSE,
    TypeOfDrefEnum,
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
    getCombinedKey,
    type TemplateField,
} from '#utils/importTemplate';
import {
    actionsTabFields,
    eventDetailTabFields,
    operationTabFields,
    overviewTabFields,
    timeframeAndContactsTabFields,
} from '#views/DrefApplicationForm/common';

import {
    addHeadingRow,
    addInputRow,
    buildCoverWorksheetForDrefApplication,
    headerRowStyle,
    hexToArgb,
} from '../utils';
import useImportTemplateSchema from './useImportTemplateSchema';

import i18n from './i18n.json';

function typeOfDrefKeySelector(option: { key: TypeOfDrefEnum }) {
    return option.key;
}

async function generateTemplate(
    templateActions: TemplateField[],
    optionsMap: ReturnType<typeof useImportTemplateSchema>['optionsMap'],
    drefTypeLabelMap: Record<TypeOfDrefEnum, string> | undefined,
    typeOfDref: TypeOfDrefEnum,
    callback: () => void,
) {
    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const typeOfDrefLabel = drefTypeLabelMap?.[typeOfDref ?? DREF_TYPE_RESPONSE] ?? '';

    const coverWorksheet = workbook.addWorksheet(
        'DREF Import',
        { properties: { tabColor: { argb: hexToArgb(COLOR_PRIMARY_RED, '10') } } },
    );
    await buildCoverWorksheetForDrefApplication(coverWorksheet, workbook);

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

    const sheetMap: Record<DrefSheetName, xlsx.Worksheet> = {
        [SHEET_OPERATION_OVERVIEW]: overviewWorksheet,
        [SHEET_EVENT_DETAIL]: eventDetailsWorksheet,
        [SHEET_ACTIONS_NEEDS]: actionsNeedsWorksheet,
        [SHEET_OPERATION]: operationWorksheet,
        [SHEET_TIMEFRAMES_AND_CONTACTS]: timeframeAndContactsWorksheet,
    };

    const optionsWorksheet = workbook.addWorksheet('options');
    // optionsWorksheet.state = 'veryHidden';
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
                cell.name = getCombinedKey(option.key, key);
                cell.value = option.label;
            });
        }
    });

    function groupTemplateActionsByTab() {
        return listToGroupList(
            templateActions,
            (templateAction) => {
                // FIXME: We should instead use a helper function to get the fieldName
                const fieldName = String(templateAction.name).split('__')[0];
                return fieldNameToTabNameMap[fieldName];
            },
        );
    }

    const tabGroupedTemplateActions = mapToList(
        groupTemplateActionsByTab(),
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
            if (templateAction.type === 'heading') {
                addHeadingRow(
                    worksheet,
                    i + ROW_OFFSET,
                    templateAction.outlineLevel,
                    String(templateAction.name),
                    templateAction.label,
                    templateAction.description,
                );
                worksheet.mergeCells(i + ROW_OFFSET, 1, i + ROW_OFFSET, 3);
                lastHeadingIndex = i + 1;
            } else if (templateAction.type === 'input') {
                // NOTE: Determines the headingType based on the index
                // position relative to the last heading, list heading is for list section.
                const headingType = (i - lastHeadingIndex) % 2 === 0 ? 'listHeading' : 'heading';
                if (templateAction.dataValidation === 'list') {
                    addInputRow(
                        headingType,
                        worksheet,
                        i + ROW_OFFSET,
                        templateAction.outlineLevel,
                        String(templateAction.name),
                        templateAction.label,
                        templateAction.description,
                        'list',
                        String(templateAction.optionsKey),
                        optionsWorksheet,
                    );
                } else if (templateAction.dataValidation === 'textArea') {
                    addInputRow(
                        headingType,
                        worksheet,
                        i + ROW_OFFSET,
                        templateAction.outlineLevel,
                        String(templateAction.name),
                        templateAction.label,
                        templateAction.description,
                        'text',
                    );
                    const row = worksheet.getRow(i + ROW_OFFSET);
                    row.height = 100;
                } else {
                    addInputRow(
                        headingType,
                        worksheet,
                        i + ROW_OFFSET,
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
                    cell.style = headerRowStyle;
                },
            );
        },
    );

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

interface Props {
    onComplete: () => void;
}

function DownloadImportTemplateModal(props: Props) {
    const { onComplete } = props;

    const { dref_dref_dref_type } = useGlobalEnums();
    const strings = useTranslation(i18n);

    const [generationPending, setGenerationPending] = useState(false);
    const [typeOfDref, setTypeOfDref] = useState<TypeOfDrefEnum>(DREF_TYPE_RESPONSE);

    const { drefFormSchema, optionsMap } = useImportTemplateSchema();
    const templateActions = createImportTemplate(drefFormSchema, optionsMap);

    const drefTypeLabelMap = useMemo(
        () => (
            listToMap(
                dref_dref_dref_type,
                (option) => option.key,
                (option) => option.value,
            )
        ),
        [dref_dref_dref_type],
    );

    const handleDownloadClick = useCallback(() => {
        if (isNotDefined(templateActions)) {
            return;
        }

        setGenerationPending((alreadyGenerating) => {
            if (!alreadyGenerating) {
                generateTemplate(
                    templateActions,
                    optionsMap,
                    drefTypeLabelMap,
                    typeOfDref,
                    () => {
                        setGenerationPending(false);
                        onComplete();
                    },
                );
            }

            return true;
        });
    }, [
        templateActions,
        optionsMap,
        onComplete,
        drefTypeLabelMap,
        typeOfDref,
    ]);

    return (
        <Modal
            heading={strings.heading}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleDownloadClick}
                    disabled={generationPending || isNotDefined(drefFormSchema)}
                >
                    {strings.downloadButtonLabel}
                </Button>
            )}
            contentViewType="vertical"
            spacing="comfortable"
            onClose={onComplete}
        >
            <RadioInput
                name={undefined}
                label="Select type of DREF for template"
                options={dref_dref_dref_type}
                keySelector={typeOfDrefKeySelector}
                labelSelector={stringValueSelector}
                value={typeOfDref}
                onChange={setTypeOfDref}
                // Only response type is available for now
                readOnly
            />
            <div>
                {strings.description}
            </div>
        </Modal>
    );
}

export default DownloadImportTemplateModal;
