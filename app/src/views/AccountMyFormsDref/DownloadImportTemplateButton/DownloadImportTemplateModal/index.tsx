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
import { createImportTemplate } from '#utils/importTemplate';
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
    buildCoverWorksheet,
    headerRowStyle,
} from '../utils';
import useImportTemplateSchema from './useImportTemplateSchema';

import i18n from './i18n.json';

function typeOfDrefKeySelector(option: { key: TypeOfDrefEnum }) {
    return option.key;
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

        async function generateTemplate() {
            const workbook = new xlsx.Workbook();
            const now = new Date();
            workbook.created = now;

            const fieldNameToTabNameMap: Record<string, string> = {
                ...listToMap(
                    overviewTabFields,
                    (key) => key,
                    () => SHEET_OPERATION_OVERVIEW,
                ),
                ...listToMap(
                    eventDetailTabFields,
                    (key) => key,
                    () => SHEET_EVENT_DETAIL,
                ),
                ...listToMap(
                    actionsTabFields,
                    (key) => key,
                    () => SHEET_ACTIONS_NEEDS,
                ),
                ...listToMap(
                    operationTabFields,
                    (key) => key,
                    () => SHEET_OPERATION,
                ),
                ...listToMap(
                    timeframeAndContactsTabFields,
                    (key) => key,
                    () => SHEET_TIMEFRAMES_AND_CONTACTS,
                ),
            };

            /*
            const description: ImportTemplateDescription<DrefRequestBody> = {
                application: 'ifrc-go',
                templateName: 'dref-application',
                meta: {
                    typeOfDref: 'response',
                },
                fieldNameToTabNameMap,
            };

            workbook.description = JSON.stringify(description);
            */

            const typeOfDrefLabel = drefTypeLabelMap?.[typeOfDref ?? DREF_TYPE_RESPONSE] ?? '';

            const coverWorksheet = workbook.addWorksheet('DREF Import');
            await buildCoverWorksheet(coverWorksheet, workbook, typeOfDrefLabel);

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

            const tabGroupedTemplateActions = mapToList(
                listToGroupList(
                    templateActions,
                    (templateAction) => {
                        const fieldName = String(templateAction.name).split('__')[0];
                        const tabName = fieldNameToTabNameMap[fieldName];
                        return tabName;
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
                    } else if (templateAction.type === 'input') {
                        if (templateAction.dataValidation === 'list') {
                            addInputRow(
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
                        } else {
                            addInputRow(
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

            const templateFileName = `DREF Application ${typeOfDrefLabel} import template ${now.toLocaleString()}.xlsx`;

            await workbook.xlsx.writeBuffer().then(
                (sheet) => {
                    FileSaver.saveAs(
                        new Blob([sheet], { type: 'application/vnd.ms-excel;charset=utf-8' }),
                        templateFileName,
                    );
                },
            );

            setGenerationPending(false);
            onComplete();
        }

        setGenerationPending((alreadyGenerating) => {
            if (!alreadyGenerating) {
                generateTemplate();
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
                disabled
            />
            <div>
                {strings.description}
            </div>
        </Modal>
    );
}

export default DownloadImportTemplateModal;
