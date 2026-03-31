import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    DrefTwoIcon,
    ReportingIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    ListView,
    Modal,
    RawFileInput,
    SelectInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToComponent,
    resolveToString,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import usePermissions from '#hooks/domain/usePermissions';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import { type ManageResponse } from '../common';
import LocalUnitImportSummary from '../LocalUnitImportSummary';
import {
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from '../LocalUnitsFormModal/LocalUnitsForm/schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BulkUploadEnumsResponse = NonNullable<
    GoApiResponse<'/api/v2/global-enums/'>['local_units_bulk_upload_status']
>[number];
type BulkStatusKey = BulkUploadEnumsResponse['key'];

const BULK_UPLOAD_PENDING = 3 satisfies BulkStatusKey;

interface Props {
    onClose: () => void;
    manageResponse: ManageResponse;
}

function LocalUnitBulkUploadModal(props: Props) {
    const { onClose, manageResponse } = props;

    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const [localUnitType, setLocalUnitType] = useState<number>();
    const [bulkUploadFile, setBulkUploadFile] = useState<File | undefined>();

    const isExternallyManaged = useMemo(() => {
        if (isDefined(localUnitType) && isDefined(manageResponse)) {
            return manageResponse[localUnitType]?.enabled;
        }
        return false;
    }, [localUnitType, manageResponse]);

    const {
        isSuperUser,
        isLocalUnitGlobalValidatorByType,
        isLocalUnitRegionValidatorByType,
        isLocalUnitCountryValidatorByType,
    } = usePermissions();

    const hasBulkUploadPermission = isSuperUser
        || isLocalUnitGlobalValidatorByType(localUnitType)
        || isLocalUnitCountryValidatorByType(countryResponse?.id, localUnitType)
        || isLocalUnitRegionValidatorByType(countryResponse?.region, localUnitType);

    const { response: localUnitsOptions } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const { response: bulkUploadHealthTemplate } = useRequest({
        url: '/api/v2/bulk-upload-local-unit/get-bulk-upload-template/',
        query: { bulk_upload_template: 'health_care' },
    });

    const { response: bulkUploadDefaultTemplate } = useRequest({
        url: '/api/v2/bulk-upload-local-unit/get-bulk-upload-template/',
        query: { bulk_upload_template: 'local_unit' },
    });

    const {
        pending: bulkUploadPending,
        trigger: triggerBulkUpload,
        error: bulkUploadError,
        response: bulkUploadResponse,
    } = useLazyRequest({
        formData: true,
        url: '/api/v2/bulk-upload-local-unit/',
        method: 'POST',
        body: (body) => body as never,
        onSuccess: () => {
            setBulkUploadFile(undefined);
        },
    });

    const { response: importSummaryResponse, pending: importSummaryPending } = useRequest({
        url: '/api/v2/bulk-upload-local-unit/{id}/',
        skip: isNotDefined(bulkUploadResponse?.id),
        pathVariables: isDefined(bulkUploadResponse)
            ? {
                id: bulkUploadResponse?.id,
            }
            : undefined,
        shouldPoll: (poll) => {
            if (poll?.errored || poll?.value?.status !== BULK_UPLOAD_PENDING) {
                return -1;
            }

            return 5000;
        },
    });

    const error = transformObjectError(
        bulkUploadError?.value.formErrors,
        () => undefined,
    );

    const handleStartUploadButtonClick = useCallback(() => {
        if (
            isNotDefined(bulkUploadFile)
            || isNotDefined(countryResponse?.id)
            || isNotDefined(localUnitType)
        ) {
            return;
        }
        triggerBulkUpload({
            country: countryResponse?.id,
            local_unit_type: localUnitType,
            file: bulkUploadFile,
        });
    }, [triggerBulkUpload, localUnitType, bulkUploadFile, countryResponse?.id]);

    const permissionError = useMemo(() => {
        if (!hasBulkUploadPermission && !isExternallyManaged) {
            return strings.noPermissionBothDescription;
        }
        if (!hasBulkUploadPermission) {
            return strings.noPermissionErrorDescription;
        }
        if (!isExternallyManaged) {
            return strings.noPermissionExternallyManaged;
        }
        return undefined;
    }, [
        hasBulkUploadPermission,
        isExternallyManaged,
        strings.noPermissionBothDescription,
        strings.noPermissionExternallyManaged,
        strings.noPermissionErrorDescription,
    ]);

    const pending = bulkUploadPending
        || importSummaryPending
        || importSummaryResponse?.status === BULK_UPLOAD_PENDING;

    // FIXME: update styling
    return (
        <Modal
            heading={resolveToString(strings.modalHeading, {
                countryName: countryResponse?.name ?? '--',
            })}
            withHeaderBorder
            onClose={onClose}
            headerDescription={
                !pending
                    ? strings.modalDescription
                    : strings.modalImportPendingDescription
            }
            footerActions={(
                <Button name={undefined} onClick={onClose} disabled={bulkUploadPending}>
                    {strings.closeButtonLabel}
                </Button>
            )}
        >
            <ListView layout="block" spacing="lg">
                <SelectInput
                    required
                    nonClearable
                    label={strings.localUnitTypeInputLabel}
                    value={localUnitType}
                    onChange={setLocalUnitType}
                    name="local_unit_type"
                    disabled={pending || isDefined(importSummaryResponse)}
                    options={localUnitsOptions?.type}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                />
                {isDefined(localUnitType) && isDefined(permissionError) && (
                    <NonFieldError error={permissionError} />
                )}
                <NonFieldError
                    error={importSummaryResponse?.error_message}
                />
                {isNotDefined(importSummaryResponse) && (
                    <Container
                        headingLevel={4}
                        heading={strings.uploadFileSectionTitle}
                        headerDescription={strings.uploadFileSectionDescription}
                        footer={(
                            <ListView layout="block" spacing="xl">
                                <span>
                                    {resolveToComponent(strings.contentStructureDescription, {
                                        templateLink: (
                                            <Link
                                                external
                                                href={
                                                    localUnitType === TYPE_HEALTH_CARE
                                                        ? bulkUploadHealthTemplate?.template_url
                                                        : bulkUploadDefaultTemplate?.template_url
                                                }
                                                styleVariant="action"
                                                withUnderline
                                            >
                                                {strings.templateLinkLabel}
                                            </Link>
                                        ),
                                    })}
                                </span>
                                <TextOutput
                                    strongLabel
                                    valueType="text"
                                    label={strings.contentStructureNoteLabel}
                                    value={strings.contentStructureNote}
                                />
                            </ListView>
                        )}
                    >
                        <NonFieldError
                            error={error as Error<PartialLocalUnits>}
                        />
                        {isNotDefined(bulkUploadFile) && (
                            <RawFileInput
                                name="file"
                                accept=".xlsx, .xlsm"
                                onChange={setBulkUploadFile}
                                styleVariant="outline"
                                disabled={
                                    !hasBulkUploadPermission || !isExternallyManaged || pending
                                }
                                before={<DrefTwoIcon className={styles.icon} />}
                            >
                                {strings.selectFileButtonLabel}
                            </RawFileInput>
                        )}
                        {isDefined(bulkUploadFile) && (
                            <ListView>
                                <ReportingIcon className={styles.fileIcon} />
                                {bulkUploadFile.name}
                                <ListView>
                                    <Button name={undefined} onClick={setBulkUploadFile}>
                                        {strings.cancelUploadButtonLabel}
                                    </Button>
                                    <Button
                                        name={undefined}
                                        onClick={handleStartUploadButtonClick}
                                    >
                                        {strings.startUploadButtonLabel}
                                    </Button>
                                </ListView>
                            </ListView>
                        )}
                    </Container>
                )}
                {isDefined(importSummaryResponse) && (
                    <LocalUnitImportSummary
                        value={importSummaryResponse}
                        withBackground
                        withPadding
                    />
                )}
            </ListView>
        </Modal>
    );
}

export default LocalUnitBulkUploadModal;
