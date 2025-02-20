import {
    useCallback,
    useState,
} from 'react';
import { DrefTwoIcon } from '@ifrc-go/icons';
import {
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { encodeDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isObject,
} from '@togglecorp/fujs';
import xlsx, {
    type CellValue,
    type Row,
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
import { type PartialDref } from '#views/DrefApplicationForm/schema';

import i18n from './i18n.json';
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

    if (isNotDefined(cellValue.result)) {
        return undefined;
    }

    if (typeof cellValue.result === 'object' && 'error' in cellValue.result) {
        return undefined;
    }

    // Formula result
    return getValueFromCellValue(cellValue.result);
}

function getNameAndValueFromRow(row: Row) {
    // NOTE: Cell(1) is used for the field name & Cell(2) is used for it's value.
    const name = row.getCell(1)?.name;
    const value = getValueFromCellValue(row.getCell(2)?.value);

    return {
        name,
        value,
    };
}

interface Props {
    onClose: () => void;
    onImport?: (formFields: PartialDref) => void;
}

function DrefImportModal(props: Props) {
    const { onClose, onImport } = props;
    const strings = useTranslation(i18n);

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
                        strings.drefImportButton,
                        {
                            variant: 'danger',
                            description: strings.drefImportFailedDescription,
                            debugMessage: 'Length of worksheet should be exactly 5.',
                        },
                    );

                    return;
                }

                const formValues: Record<string, string | number | boolean> = {};
                worksheets.forEach((worksheet) => {
                    worksheet?.eachRow((row) => {
                        const { name, value } = getNameAndValueFromRow(row);
                        if (isNotDefined(name) || isNotDefined(value)) {
                            return;
                        }
                        formValues[name] = value;
                    });
                });

                const formValuesFromExcel = getValueFromImportTemplate(
                    drefFormSchema,
                    optionsMap,
                    formValues,
                );

                if (onImport && isObject(formValuesFromExcel)) {
                    onImport({
                        ...(formValuesFromExcel as unknown as PartialDref),
                        // FIXME: get this from template
                        type_of_dref: DREF_TYPE_RESPONSE,
                    });
                    onClose();
                }
            } catch (ex) {
                alert.show(
                    strings.drefImportFailed,
                    {
                        variant: 'danger',
                        description: strings.drefImportFailedDescription,
                        debugMessage: JSON.stringify(ex),
                    },
                );
            }
        }

        loadFile(file);
    }, [
        onImport,
        onClose,
        alert,
        drefFormSchema,
        optionsMap,
        strings,
    ]);

    return (
        <Modal
            heading={strings.drefImportApplication}
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
            >
                {strings.drefImportSelectFile}
            </RawFileInput>
            <div>
                {strings.drefImportTemplate}
            </div>
        </Modal>
    );
}

export default DrefImportModal;
