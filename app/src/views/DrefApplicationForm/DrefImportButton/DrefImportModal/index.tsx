import {
    useCallback,
    useState,
} from 'react';
import { DrefTwoIcon } from '@ifrc-go/icons';
import {
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import { encodeDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isObject,
} from '@togglecorp/fujs';
import xlsx, {
    CellValue,
    Row,
} from 'exceljs';

import useAlert from '#hooks/useAlert';
import { DREF_TYPE_RESPONSE } from '#utils/constants';
import {
    SHEET_ACTIONS_NEEDS,
    SHEET_EVENT_DETAIL,
    SHEET_OPERATION,
    SHEET_OPERATION_OVERVIEW,
    SHEET_TIMEFRAMES_AND_CONTACTS,
} from '#utils/domain/dref';
import { getValueFromImportTemplate } from '#utils/importTemplate';
import useImportTemplateSchema from '#views/AccountMyFormsDref/DownloadImportTemplateButton/DownloadImportTemplateModal/useImportTemplateSchema';
import { DrefRequestBody } from '#views/DrefApplicationForm/schema';

import styles from './styles.module.css';

function getValueFromCellValue(cellValue: CellValue) {
    if (isNotDefined(cellValue)) {
        return undefined;
    }

    if (
        typeof cellValue === 'number'
            || typeof cellValue === 'string'
            || typeof cellValue === 'boolean'
    ) {
        return cellValue;
    }

    if (cellValue instanceof Date) {
        return encodeDate(cellValue);
    }

    if ('error' in cellValue) {
        return undefined;
    }

    if ('richText' in cellValue) {
        return cellValue.richText.map(({ text }) => text).join('');
    }

    if ('hyperlink' in cellValue) {
        const MAIL_IDENTIFIER = 'mailto:';
        if (cellValue.hyperlink.startsWith(MAIL_IDENTIFIER)) {
            return cellValue.hyperlink.substring(MAIL_IDENTIFIER.length);
        }

        return cellValue.hyperlink;
    }

    // Formula result
    return getValueFromCellValue(cellValue.result);
}

function getNameAndValueFromRow(row: Row) {
    const name = row.getCell(1)?.name;
    const value = getValueFromCellValue(row.getCell(2)?.value);

    return {
        name,
        value,
    };
}

interface Props {
    onClose: () => void;
    onImport?: (formFields?: DrefRequestBody) => void;
}

function DrefImportModal(props: Props) {
    const { onClose, onImport } = props;

    const { drefFormSchema, optionsMap } = useImportTemplateSchema();
    const alert = useAlert();
    const [importPending, setImportPending] = useState(false);

    const handleChange = useCallback((file: File | undefined) => {
        if (isNotDefined(file)) {
            return;
        }

        async function loadFile(excelFile: File) {
            try {
                setImportPending(true);
                const workbook = new xlsx.Workbook();
                const buffer = await excelFile.arrayBuffer();
                await workbook.xlsx.load(buffer);

                const worksheets = [
                    workbook.getWorksheet(SHEET_OPERATION_OVERVIEW),
                    workbook.getWorksheet(SHEET_EVENT_DETAIL),
                    workbook.getWorksheet(SHEET_ACTIONS_NEEDS),
                    workbook.getWorksheet(SHEET_OPERATION),
                    workbook.getWorksheet(SHEET_TIMEFRAMES_AND_CONTACTS),
                ].filter(isDefined);

                // TODO: figure out better method for template validation
                if (worksheets.length !== 5) {
                    alert.show(
                        // FIXME: use strings,
                        'Invalid import file',
                        {
                            variant: 'danger',
                            description: 'Failed to process the selected import file, make sure you\'ve downloaded the import template from the GO platform.',
                        },
                    );

                    return;
                }

                const formValues: Record<string, string> = {};
                worksheets.forEach((worksheet) => {
                    worksheet?.eachRow((row) => {
                        const { name, value } = getNameAndValueFromRow(row);

                        if (isNotDefined(name) || isNotDefined(value)) {
                            return;
                        }

                        formValues[name] = String(value);
                    });
                });

                const formValuesFromExcel = getValueFromImportTemplate(
                    drefFormSchema,
                    optionsMap,
                    formValues,
                );

                if (onImport && isObject(formValuesFromExcel)) {
                    onImport({
                        ...(formValuesFromExcel as unknown as DrefRequestBody),
                        // FIXME: get this from template
                        type_of_dref: DREF_TYPE_RESPONSE,
                    });
                    onClose();
                }
            } catch (ex) {
                // FIXME: use strings,
                alert.show(
                    'Failed to import',
                    {
                        variant: 'danger',
                        description: 'Failed to process the selected import file, make sure you\'ve downloaded the import template from the GO platform.',
                        debugMessage: JSON.stringify(ex),
                    },
                );
            }
        }

        loadFile(file);
    }, [onImport, onClose, alert, drefFormSchema, optionsMap]);

    return (
        <Modal
            // FIXME use strings
            heading="Import DREF Application"
            onClose={onClose}
            contentViewType="vertical"
            className={styles.importDrefApplicationModal}
            childrenContainerClassName={styles.content}
            spacing="comfortable"
        >
            <DrefTwoIcon className={styles.icon} />
            <RawFileInput
                name={undefined}
                accept=".xlsx"
                onChange={handleChange}
                variant="secondary"
                disabled={isNotDefined(drefFormSchema) || importPending}
                // FIXME: use strings
            >
                Select file (xlsx)
            </RawFileInput>
            <div>
                {/* FIXME: use strings */}
                Please select the filled template for the DREF Application
            </div>
        </Modal>
    );
}

export default DrefImportModal;
