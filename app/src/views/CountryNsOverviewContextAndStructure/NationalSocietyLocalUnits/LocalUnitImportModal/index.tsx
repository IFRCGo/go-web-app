import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    AlarmWarningLineIcon,
    DrefTwoIcon,
    ReportingIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    InlineLayout,
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
    listToMap,
} from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import usePermissions from '#hooks/domain/usePermissions';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import LocalUnitImportSummary from '../LocalUnitImportSummary';
import {
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from '../LocalUnitsFormModal/schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BulkUploadEnumsResponse = NonNullable<
    GoApiResponse<'/api/v2/global-enums/'>['local_units_bulk_upload_status']
>[number];
type BulkStatusKey = BulkUploadEnumsResponse['key'];

const BULK_UPLOAD_PENDING = 3 satisfies BulkStatusKey;

interface Props {
    onClose: () => void;
}

function LocalUnitBulkUploadModal(props: Props) {
    const { onClose } = props;

    const strings = useTranslation(i18n);

    // FIXME: country response should come from props
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const countryId = countryResponse?.id;

    const [selectedLocalUnitType, setSelectedLocalUnitType] = useState<number>();
    const [bulkUploadFile, setBulkUploadFile] = useState<File | undefined>();

    const {
        response: externallyManagedLocalUnitsResponse,
        pending: externallyManagedLocalUnitsPending,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryId,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const externallyManagedUnitByType = useMemo(() => (
        listToMap(
            externallyManagedLocalUnitsResponse?.results,
            ({ local_unit_type_details }) => local_unit_type_details.id,
            ({ enabled }) => enabled,
        )
    ), [externallyManagedLocalUnitsResponse?.results]);

    const isCurrentlySelectedTypeExternallyManaged = useMemo(() => {
        if (isNotDefined(selectedLocalUnitType)) {
            return false;
        }

        return externallyManagedUnitByType?.[selectedLocalUnitType];
    }, [selectedLocalUnitType, externallyManagedUnitByType]);

    const {
        isSuperUser,
        isLocalUnitGlobalValidatorByType,
        isLocalUnitRegionValidatorByType,
        isLocalUnitCountryValidatorByType,
    } = usePermissions();

    const hasBulkUploadPermission = isSuperUser
        || isLocalUnitGlobalValidatorByType(selectedLocalUnitType)
        || isLocalUnitCountryValidatorByType(countryResponse?.id, selectedLocalUnitType)
        || isLocalUnitRegionValidatorByType(countryResponse?.region, selectedLocalUnitType);

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
        if (isNotDefined(bulkUploadFile)
            || isNotDefined(countryResponse?.id)
            || isNotDefined(selectedLocalUnitType)
        ) {
            return;
        }
        triggerBulkUpload({
            country: countryResponse?.id,
            local_unit_type: selectedLocalUnitType,
            file: bulkUploadFile,
        });
    }, [triggerBulkUpload, selectedLocalUnitType, bulkUploadFile, countryResponse?.id]);

    const permissionError = useMemo(() => {
        if (!hasBulkUploadPermission && !isCurrentlySelectedTypeExternallyManaged) {
            return strings.noPermissionBothDescription;
        }
        if (!hasBulkUploadPermission) {
            return strings.noPermissionErrorDescription;
        }
        if (!isCurrentlySelectedTypeExternallyManaged) {
            return strings.noPermissionExternallyManaged;
        }
        return undefined;
    }, [
        hasBulkUploadPermission,
        isCurrentlySelectedTypeExternallyManaged,
        strings.noPermissionBothDescription,
        strings.noPermissionExternallyManaged,
        strings.noPermissionErrorDescription,
    ]);

    const pending = bulkUploadPending
        || importSummaryPending
        || externallyManagedLocalUnitsPending
        || importSummaryResponse?.status === BULK_UPLOAD_PENDING;

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
                <Button
                    name={undefined}
                    onClick={onClose}
                    disabled={bulkUploadPending}
                >
                    {strings.closeButtonLabel}
                </Button>
            )}
        >
            <ListView layout="block">
                <SelectInput
                    required
                    nonClearable
                    label={strings.localUnitTypeInputLabel}
                    value={selectedLocalUnitType}
                    onChange={setSelectedLocalUnitType}
                    name="local_unit_type"
                    disabled={pending || isDefined(importSummaryResponse)}
                    options={localUnitsOptions?.type}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                />
                {isDefined(selectedLocalUnitType) && isDefined(permissionError) && (
                    <NonFieldError error={permissionError} />
                )}
                <NonFieldError error={importSummaryResponse?.error_message} />
                {isNotDefined(importSummaryResponse) && (
                    <Container
                        headingLevel={5}
                        heading={strings.uploadFileSectionTitle}
                        headerDescription={strings.uploadFileSectionDescription}
                    >
                        <ListView layout="block">
                            {error && <NonFieldError error={error as Error<PartialLocalUnits>} />}
                            {isNotDefined(bulkUploadFile) && (
                                <RawFileInput
                                    name="file"
                                    accept=".xlsx, .xlsm"
                                    onChange={setBulkUploadFile}
                                    styleVariant="outline"
                                    colorVariant="primary"
                                    disabled={!hasBulkUploadPermission
                                        || !isCurrentlySelectedTypeExternallyManaged || pending}
                                    before={<DrefTwoIcon className={styles.icon} />}
                                >
                                    {strings.selectFileButtonLabel}
                                </RawFileInput>
                            )}
                            {isDefined(bulkUploadFile) && (
                                <ListView
                                    withPadding
                                    withDarkBackground
                                    withSpaceBetweenContents
                                >
                                    <InlineLayout
                                        before={<ReportingIcon className={styles.fileIcon} />}
                                        spacing="xs"
                                    >
                                        {bulkUploadFile.name}
                                    </InlineLayout>
                                    <ListView spacing="sm">
                                        <Button
                                            name={undefined}
                                            onClick={setBulkUploadFile}
                                        >
                                            {strings.cancelUploadButtonLabel}
                                        </Button>
                                        <Button
                                            name={undefined}
                                            onClick={handleStartUploadButtonClick}
                                            styleVariant="filled"
                                        >
                                            {strings.startUploadButtonLabel}
                                        </Button>
                                    </ListView>
                                </ListView>
                            )}
                            <ListView
                                spacing="2xs"
                                layout="block"
                                withSpacingOpticalCorrection
                            >
                                <span>
                                    {resolveToComponent(strings.contentStructureDescription, {
                                        templateLink: (
                                            <Link
                                                external
                                                href={
                                                    selectedLocalUnitType === TYPE_HEALTH_CARE
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
                                    withBlockLayout
                                    spacing="sm"
                                />
                            </ListView>
                        </ListView>
                    </Container>
                )}
                {isDefined(importSummaryResponse) && (
                    <LocalUnitImportSummary
                        value={importSummaryResponse}
                        withBackground
                        withPadding
                    />
                )}
                {!pending && (
                    <InlineLayout
                        className={styles.warning}
                        before={<AlarmWarningLineIcon className={styles.alarmIcon} />}
                        withPadding
                    >
                        {strings.importWarning}
                    </InlineLayout>
                )}
            </ListView>
        </Modal>
    );
}

export default LocalUnitBulkUploadModal;
