import {
    useCallback,
    useContext,
    useState,
} from 'react';
import { DrefTwoIcon } from '@ifrc-go/icons';
import {
    ListView,
    Message,
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { encodeDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isObject,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import xlsx, {
    type CellValue,
    type Row,
} from 'exceljs';

import DomainContext from '#contexts/domain';
import useAlert from '#hooks/useAlert';
import {
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    DREF_OPTIONS_SHEET_NAME,
    DREF_TYPE_CELL_COLUMN,
    DREF_TYPE_CELL_ROW,
    getDrefSheetNames,
} from '#utils/domain/dref';
import { getValueFromImportTemplate } from '#utils/importTemplate';
import useImportTemplateSchema from '#views/AccountMyFormsDref/DownloadImportTemplateButton/DownloadImportTemplateModal/useImportTemplateSchema';
import {
    calculateProposedActionsCost,
    EARLY_ACTION,
    EARLY_RESPONSE,
    OPERATION_TIMEFRAME_IMMINENT,
} from '#views/DrefApplicationForm/common';
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

// NOTE: An imported Imminent file is parsed into whatever proposed-action blocks
// were filled. The form always carries both an Early Action and an Early Response
// block, and the derived costs (read-only in the form) won't recompute on a bulk
// setValue. So normalise both blocks (preserving imported data) and compute the
// costs + the fixed operation timeframe before handing the values to the form.
function finalizeImminentImport(values: PartialDref): PartialDref {
    type ProposedActionValue = NonNullable<PartialDref['proposed_action']>[number];

    const proposedActionByType = listToMap(
        values.proposed_action ?? [],
        (action) => action.proposed_type ?? '<no-type>',
        (action) => action,
    );

    const proposedAction: ProposedActionValue[] = ([EARLY_ACTION, EARLY_RESPONSE] as const).map(
        (proposedType) => proposedActionByType?.[proposedType]
            ?? { client_id: randomString(), proposed_type: proposedType },
    );

    const withProposedAction: PartialDref = {
        ...values,
        proposed_action: proposedAction,
        operation_timeframe_imminent: OPERATION_TIMEFRAME_IMMINENT,
    };

    return {
        ...withProposedAction,
        ...calculateProposedActionsCost(withProposedAction),
    };
}

interface Props {
    onClose: () => void;
    onImport?: (formFields: PartialDref) => void;
}

function DrefImportModal(props: Props) {
    const { onClose, onImport } = props;
    const strings = useTranslation(i18n);

    const { drefSchemaByType, optionsMap } = useImportTemplateSchema();
    const {
        countriesPending,
        disasterTypesPending,
        globalEnumsPending,
        primarySectorsPending,
    } = useContext(DomainContext);
    const alert = useAlert();
    const [importPending, setImportPending] = useState(false);

    // Imported values are reverse-mapped (dropdown label -> key) using this
    // reference data, and the uploaded file's type is unknown until parsed, so
    // require every source either type may need before allowing an import.
    const referenceDataPending = countriesPending
        || disasterTypesPending
        || globalEnumsPending
        || primarySectorsPending;
    const referenceDataReady = optionsMap.national_society.length > 0
        && optionsMap.disaster_type.length > 0
        && optionsMap.type_of_onset.length > 0
        && optionsMap.primary_sector.length > 0;
    const isReferenceDataMissing = !referenceDataPending && !referenceDataReady;
    const canImport = referenceDataReady && !referenceDataPending;

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

                // NOTE: The export embeds the DREF type in a fixed cell of the
                // hidden options sheet. Read it first to pick the schema and the
                // expected worksheet set. Templates without it (pre-feature) are
                // treated as Response.
                const optionsWorksheet = workbook.getWorksheet(DREF_OPTIONS_SHEET_NAME);
                const detectedType = getValueFromCellValue(
                    optionsWorksheet?.getCell(DREF_TYPE_CELL_ROW, DREF_TYPE_CELL_COLUMN)?.value,
                );
                // NOTE: The cell is written as a number; coerce a stringified value
                // defensively. Unknown/absent -> Response (covers pre-feature templates).
                const detectedTypeValue = typeof detectedType === 'string'
                    ? Number(detectedType)
                    : detectedType;
                const typeOfDref: TypeOfDrefEnum = detectedTypeValue === DREF_TYPE_IMMINENT
                    ? DREF_TYPE_IMMINENT
                    : DREF_TYPE_RESPONSE;

                const drefFormSchema = drefSchemaByType[typeOfDref];

                // NOTE: Require the workbook to carry EXACTLY the content sheets
                // expected for the detected type. A plain count check would accept
                // a Response file (5 sheets) as Imminent (whose 4 sheets are a subset).
                const expectedSheetNames = getDrefSheetNames(typeOfDref);
                const presentSheetNames = getDrefSheetNames(DREF_TYPE_RESPONSE)
                    .filter((sheetName) => isDefined(workbook.getWorksheet(sheetName)));
                const sheetsMatchType = presentSheetNames.length === expectedSheetNames.length
                    && expectedSheetNames.every(
                        (sheetName) => presentSheetNames.includes(sheetName),
                    );

                if (isNotDefined(drefFormSchema) || !sheetsMatchType) {
                    alert.show(
                        strings.drefImportButton,
                        {
                            variant: 'danger',
                            description: strings.drefImportFailedDescription,
                            debugMessage: `Expected worksheets [${expectedSheetNames.join(', ')}] for the detected DREF type.`,
                        },
                    );

                    return;
                }

                const worksheets = expectedSheetNames
                    .map((sheetName) => workbook.getWorksheet(sheetName))
                    .filter(isDefined);

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
                    const importedValues: PartialDref = {
                        ...(formValuesFromExcel as unknown as PartialDref),
                        type_of_dref: typeOfDref,
                    };

                    onImport(typeOfDref === DREF_TYPE_IMMINENT
                        ? finalizeImminentImport(importedValues)
                        : importedValues);
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
        drefSchemaByType,
        optionsMap,
        strings,
    ]);

    return (
        <Modal
            heading={strings.drefImportApplication}
            onClose={onClose}
            className={styles.importDrefApplicationModal}
        >
            <ListView layout="block">
                <DrefTwoIcon className={styles.icon} />
                <RawFileInput
                    name={undefined}
                    accept=".xlsx"
                    onChange={handleChange}
                    styleVariant="outline"
                    disabled={importPending || !canImport}
                >
                    {strings.drefImportSelectFile}
                </RawFileInput>
                {referenceDataPending && (
                    <Message
                        compact
                        pending
                        title={strings.drefImportDataPending}
                    />
                )}
                {isReferenceDataMissing && (
                    <Message
                        compact
                        variant="error"
                        title={strings.drefImportDataMissingTitle}
                        description={strings.drefImportDataMissingDescription}
                    />
                )}
                {!referenceDataPending && !isReferenceDataMissing && (
                    <div>
                        {strings.drefImportTemplate}
                    </div>
                )}
            </ListView>
        </Modal>
    );
}

export default DrefImportModal;
