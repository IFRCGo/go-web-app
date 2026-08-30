import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Container,
    DateInput,
    DateOutput,
    Label,
    ListView,
    Modal,
    SelectInput,
    Switch,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToComponent,
    resolveToString,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';

import BaseMapPointInput from '#components/domain/BaseMapPointInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import NonFieldError from '#components/NonFieldError';
import useAuth from '#hooks/domain/useAuth';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import {
    OTHER_AFFILIATION,
    VISIBILITY_PUBLIC,
} from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    EXTERNALLY_MANAGED,
    injectClientIdToResponse,
    PENDING_VALIDATION,
    UNVALIDATED,
    VALIDATED,
} from '../common';
import LocalUnitStatus from '../LocalUnitStatus';
import LocalUnitValidateButton from '../LocalUnitValidateButton';
import LocalUnitValidateModal from '../LocalUnitValidateModal';
import LocalUnitViewModal from '../LocalUnitViewModal';
import HealthFields from './HealthFields';
import schema, {
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from './schema';

import i18n from './i18n.json';

type LocalUnitsCreateBody = GoApiBody<'/api/v2/local-units/', 'POST'>;
type LocalUnitsUpdateBody = GoApiBody<'/api/v2/local-units/{id}/', 'PATCH'>;

type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]

type HealthLocalUnitFormFields = NonNullable<PartialLocalUnits['health']>;

const visibilityKeySelector = (option: VisibilityOptions) => option.key;

interface Props {
    localUnitId?: number;
    readOnly?: boolean;
    setReadOnly?: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: (shouldUpdate?: boolean) => void;
}

function LocalUnitsFormModal(props: Props) {
    const {
        onClose,
        localUnitId,
        readOnly: readOnlyFromProps,
        setReadOnly,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { isAuthenticated } = useAuth();

    const {
        isSuperUser,
        isCountryAdmin,
        isRegionAdmin,
        isLocalUnitGlobalValidatorByType,
        isLocalUnitRegionValidatorByType,
        isLocalUnitCountryValidatorByType,
        canEditLocalUnit,
    } = usePermissions();

    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();
    const [updateReason, setUpdateReason] = useState<string>();
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

    const [showPrevValue, setShowPrevValue] = useState(false);
    const [highlightChanges, setHighlightChanges] = useState(true);

    const [
        showValidateModal,
        {
            setTrue: setShowValidateModalTrue,
            setFalse: setShowValidateModalFalse,
        },
    ] = useBooleanState(false);

    // FIXME: this should come from props
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        schema,
        {
            value: {
                visibility: VISIBILITY_PUBLIC,
                country: Number(countryId),
            },
        },
    );

    const {
        pending: addLocalUnitPending,
        trigger: addLocalUnit,
    } = useLazyRequest({
        url: '/api/v2/local-units/',
        method: 'POST',
        body: (fields: LocalUnitsCreateBody) => fields,
        onSuccess: () => {
            alert.show(
                strings.successMessage,
                { variant: 'success' },
            );

            onClose(true);
        },
        onFailure: (response) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                // debugMessage,
            } = response;

            setError(transformObjectError(
                formErrors,
                () => undefined,
            ));

            alert.show(
                strings.failedMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    // FIXME: debug message copy button cannot be clicked because of Modal
                    // debugMessage,
                },
            );
        },
    });

    const {
        pending: updateLocalUnitsPending,
        trigger: updateLocalUnit,
    } = useLazyRequest({
        method: 'PATCH',
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        body: (fields: LocalUnitsUpdateBody) => fields,
        onSuccess: () => {
            alert.show(
                strings.updateMessage,
                { variant: 'success' },
            );

            onClose(true);
        },
        onFailure: (response) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                // debugMessage,
            } = response;

            setError(transformObjectError(
                formErrors,
                () => undefined,
            ));

            alert.show(
                strings.updateFailedMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    // FIXME: debug message copy button cannot be clicked because of Modal
                    // debugMessage,
                },
            );

            // formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
            // setShowChangesModalFalse();
        },
    });

    const {
        response: localUnitDetailsResponse,
        pending: localUnitDetailsPending,
        error: localUnitDetailsError,
        retrigger: refetchLocalUnitDetails,
    } = useRequest({
        skip: isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId)
            ? ({ id: localUnitId })
            : undefined,
        onSuccess: (response) => {
            const responseWithClientId = injectClientIdToResponse(response);

            if (isDefined(responseWithClientId)) {
                setValue(responseWithClientId);
            }
        },
    });

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
        onSuccess: (response) => {
            if (isNotDefined(localUnitId)) {
                // FIXME: add first non-managed type
                setFieldValue(response.type[0]?.code, 'type');
            }
        },
    });

    const localUnitTypeLabelMap = useMemo(() => (
        listToMap(
            localUnitsOptions?.type,
            ({ id }) => id,
            ({ name }) => name,
        )
    ), [localUnitsOptions?.type]);

    const shouldFetchChangeRequest = localUnitDetailsResponse?.status === UNVALIDATED
        || localUnitDetailsResponse?.status === PENDING_VALIDATION;

    const {
        response: localUnitPreviousResponse,
        pending: localUnitPreviousResponsePending,
    } = useRequest({
        skip: isNotDefined(localUnitId) || !shouldFetchChangeRequest,
        url: '/api/v2/local-units/{id}/latest-change-request/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

    const {
        response: externallyManagedLocalUnitsResponse,
        pending: externallyManagedResponsePending,
    } = useRequest({
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryResponse?.id,
            limit: 9999,
        },
    });

    const loading = localUnitDetailsPending
        || localUnitPreviousResponsePending
        || localUnitsOptionsPending
        || externallyManagedResponsePending;

    const saving = updateLocalUnitsPending || addLocalUnitPending;

    const externallyManagedByLocalUnitType = useMemo(() => {
        if (isNotDefined(externallyManagedLocalUnitsResponse?.results)) {
            return undefined;
        }

        return listToMap(
            externallyManagedLocalUnitsResponse?.results,
            (res) => res.local_unit_type_details.id,
            (res) => res.enabled,
        );
    }, [externallyManagedLocalUnitsResponse]);

    const handleSubmitButtonClick = useCallback(
        () => {
            const result = validate();

            if (result.errored) {
                setError(result.error);
                setShowSubmitConfirmation(false);
                return;
            }

            if (isDefined(localUnitId)) {
                const finalValue = {
                    ...result.value,
                    update_reason_overview: updateReason,
                };
                updateLocalUnit(finalValue as LocalUnitsCreateBody);
            } else {
                addLocalUnit(result.value as LocalUnitsCreateBody);
            }
        },
        [
            validate,
            localUnitId,
            setError,
            updateLocalUnit,
            addLocalUnit,
            updateReason,
        ],
    );

    const handleCancelButtonClick = useCallback(() => {
        setShowSubmitConfirmation(false);
    }, []);

    const handleDoneButtonClick = useCallback(() => {
        const result = validate();

        if (result.errored) {
            setError(result.error);
            return;
        }

        setShowSubmitConfirmation(true);
    }, [setError, validate]);

    const handleLocalUnitValidate = useCallback(() => {
        refetchLocalUnitDetails();
        onClose(true);
    }, [refetchLocalUnitDetails, onClose]);

    const setHealthFieldValue = useFormObject<'health', HealthLocalUnitFormFields>(
        'health',
        setFieldValue,
        {},
    );

    const prevValue = useMemo(() => {
        const prevData = localUnitPreviousResponse
            ?.previous_data_details as unknown as LocalUnitResponse | undefined;

        return injectClientIdToResponse(prevData);
    }, [localUnitPreviousResponse?.previous_data_details]);

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);

    const isEditable = localUnitDetailsResponse?.status === VALIDATED;

    const isNewlyCreated = isNotDefined(localUnitDetailsResponse?.status)
        || localUnitDetailsResponse?.status === UNVALIDATED;
    const isExternallyManaged = localUnitDetailsResponse?.status === EXTERNALLY_MANAGED;
    const isExternallyManagedType = isDefined(value.type)
        ? !!(externallyManagedByLocalUnitType?.[value.type])
        : false;

    const hasValidatePermission = isAuthenticated
        && !isExternallyManaged
        && (isSuperUser
            || isLocalUnitGlobalValidatorByType(value.type)
            || isLocalUnitCountryValidatorByType(countryResponse?.id, value.type)
            || isLocalUnitRegionValidatorByType(countryResponse?.region, value.type)
        );
    const hasUpdatePermission = isCountryAdmin(countryResponse?.id)
        || isRegionAdmin(countryResponse?.region)
        || hasValidatePermission
        || canEditLocalUnit(countryResponse?.id);

    const changesAvailable = !isNewlyCreated
        && isDefined(localUnitId)
        && !isEditable
        && !isExternallyManaged;

    const readOnly = readOnlyFromProps
        || isExternallyManaged
        || isExternallyManagedType
        || !hasUpdatePermission;

    const withPrevValue = changesAvailable && showPrevValue;
    const withDiffView = changesAvailable && highlightChanges;

    const additionalError = useMemo(() => {
        if (readOnlyFromProps) {
            return undefined;
        }

        if (isExternallyManaged) {
            return strings.noPermissionFormUpdateExternallyManaged;
        }

        if (isExternallyManagedType) {
            return strings.noPermissionFormExternallyManaged;
        }

        if (!hasUpdatePermission) {
            if (isDefined(localUnitId)) {
                return strings.noLocalUnitEditPermission;
            }

            return strings.noLocalUnitAddPermission;
        }

        return undefined;
    }, [
        readOnlyFromProps,
        localUnitId,
        isExternallyManaged,
        isExternallyManagedType,
        hasUpdatePermission,
        strings.noPermissionFormUpdateExternallyManaged,
        strings.noLocalUnitAddPermission,
        strings.noLocalUnitEditPermission,
        strings.noPermissionFormExternallyManaged,
    ]);

    const submitButton = !readOnly && (
        <Button
            name={undefined}
            onClick={handleSubmitButtonClick}
            disabled={loading || saving || (isDefined(localUnitId) && isFalsyString(updateReason))}
        >
            {strings.submitButtonLabel}
        </Button>
    );

    const localUnitName = isDefined(value.type)
        ? localUnitTypeLabelMap?.[value.type] ?? '??'
        : '??';

    return (
        <Modal
            heading={resolveToString(
                strings.localUnitsModalHeading,
                { localUnitType: localUnitName },
            )}
            onClose={onClose}
            size="pageWidth"
            headingLevel={4}
            withContentOverflow
            headerActions={(
                <>
                    {isNotDefined(localUnitId) && submitButton}
                    {isDefined(localUnitId) && !readOnly && (
                        <Button
                            name={undefined}
                            onClick={handleDoneButtonClick}
                            disabled={loading || saving}
                            // FIXME: use strings
                        >
                            Done
                        </Button>
                    )}
                    {readOnlyFromProps && isEditable && hasUpdatePermission && (
                        <Button
                            name={false}
                            onClick={setReadOnly}
                            // FIXME: use strings
                        >
                            Edit
                        </Button>
                    )}
                    <LocalUnitValidateButton
                        status={localUnitDetailsResponse?.status}
                        onClick={setShowValidateModalTrue}
                        hasValidatePermission={hasValidatePermission}
                    />
                </>
            )}
            headerDescription={(changesAvailable || localUnitDetailsResponse) && (
                <ListView withWrap>
                    {localUnitDetailsResponse && (
                        <>
                            <div>
                                {resolveToComponent(
                                    strings.lastUpdateLabel,
                                    {
                                        modifiedAt: (
                                            <DateOutput
                                                value={localUnitDetailsResponse.modified_at}
                                            />
                                        ),
                                        modifiedBy: getUserName(
                                            localUnitDetailsResponse.modified_by_details,
                                        ),
                                    },
                                )}
                            </div>
                            <LocalUnitStatus
                                value={localUnitDetailsResponse.status}
                                valueDisplay={localUnitDetailsResponse.status_details}
                            />
                        </>
                    )}
                    {changesAvailable && (
                        <>
                            <Switch
                                name="highlightChanges"
                                label={strings.highlightChangesLabel}
                                value={highlightChanges}
                                onChange={setHighlightChanges}
                            />
                            {highlightChanges && (
                                <Switch
                                    name="showChanges"
                                    label={strings.showChangesLabel}
                                    value={showPrevValue}
                                    onChange={setShowPrevValue}
                                />
                            )}
                        </>
                    )}
                </ListView>
            )}
            pending={loading || saving}
            pendingMessage={saving ? strings.savingMessage : undefined}
            errored={isDefined(localUnitId) && isDefined(localUnitDetailsError)}
            errorMessage={localUnitDetailsError?.value.messageForNotification}
            spacing="lg"
        >
            <ListView
                layout="block"
                spacing="2xl"
            >
                <ListView withWrap>
                    <ListView
                        spacing="sm"
                        withWrap
                        withSpacingOpticalCorrection
                    >
                        <Label strong>
                            {strings.type}
                        </Label>
                        <SelectInput
                            required
                            name="type"
                            options={localUnitsOptions?.type}
                            value={value.type}
                            onChange={setFieldValue}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            error={error?.type}
                            nonClearable
                            disabled={isDefined(localUnitId)}
                        />
                    </ListView>
                    <ListView
                        spacing="sm"
                        withWrap
                        withSpacingOpticalCorrection
                    >
                        <Label strong>
                            {strings.visibility}
                        </Label>
                        <SelectInput
                            name="visibility"
                            required
                            nonClearable
                            options={visibilityOptions}
                            value={value.visibility}
                            onChange={setFieldValue}
                            keySelector={visibilityKeySelector}
                            labelSelector={stringValueSelector}
                            readOnly={readOnly}
                            error={error?.type}
                        />
                    </ListView>
                </ListView>
                <NonFieldError error={additionalError} />
                <NonFieldError error={error} />
                <Container
                    heading={strings.addressAndContactTitle}
                    headingLevel={5}
                    spacing="sm"
                    withHeaderBorder
                >
                    <ListView layout="grid">
                        <ListView layout="block">
                            <DateInput
                                name="date_of_data"
                                label={strings.dateOfUpdate}
                                value={value.date_of_data}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.date_of_data}
                                prevValue={prevValue?.date_of_data}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                                required
                            />
                            <TextInput
                                label={strings.subtype}
                                placeholder={strings.subtypeDescription}
                                name="subtype"
                                value={value.subtype}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.subtype}
                                prevValue={prevValue?.subtype}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            {value.type !== TYPE_HEALTH_CARE && (
                                <SelectInput
                                    label={strings.coverage}
                                    name="level"
                                    options={localUnitsOptions?.level}
                                    value={value.level}
                                    onChange={setFieldValue}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={readOnly}
                                    error={error?.level}
                                    prevValue={prevValue?.level}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            <TextInput
                                label={strings.localUnitNameEn}
                                name="english_branch_name"
                                value={value.english_branch_name}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.english_branch_name}
                                prevValue={prevValue?.english_branch_name}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <TextInput
                                name="local_branch_name"
                                required
                                label={strings.localUnitNameLocal}
                                value={value.local_branch_name}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.local_branch_name}
                                prevValue={prevValue?.local_branch_name}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            {value.type !== TYPE_HEALTH_CARE && hasUpdatePermission && (
                                <>
                                    <TextInput
                                        label={strings.phone}
                                        name="phone"
                                        value={value.phone}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.phone}
                                        prevValue={prevValue?.phone}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        label={strings.email}
                                        name="email"
                                        value={value.email}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.email}
                                        prevValue={prevValue?.email}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                </>
                            )}
                            {value.type !== TYPE_HEALTH_CARE && (
                                <TextInput
                                    label={strings.website}
                                    name="link"
                                    value={value.link}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.link}
                                    prevValue={prevValue?.link}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            <TextInput
                                label={strings.postCode}
                                name="postcode"
                                value={value.postcode}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.postcode}
                                prevValue={prevValue?.postcode}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            {value.type === TYPE_HEALTH_CARE && hasUpdatePermission && (
                                <>
                                    <TextInput
                                        name="focal_person_en"
                                        label={strings.focalPersonEn}
                                        value={value.focal_person_en}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.focal_person_en}
                                        prevValue={prevValue?.focal_person_en}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        required
                                        label={strings.focalPointPosition}
                                        name="focal_point_position"
                                        value={value.health?.focal_point_position}
                                        onChange={setHealthFieldValue}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_position}
                                        prevValue={prevValue?.health?.focal_point_position}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        label={strings.focalPointEmail}
                                        required
                                        name="focal_point_email"
                                        value={value.health?.focal_point_email}
                                        onChange={setHealthFieldValue}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_email}
                                        prevValue={prevValue?.health?.focal_point_email}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        label={strings.focalPointPhoneNumber}
                                        name="focal_point_phone_number"
                                        value={value.health?.focal_point_phone_number}
                                        onChange={setHealthFieldValue}
                                        readOnly={readOnly}
                                        error={
                                            healthFormError?.focal_point_phone_number
                                        }
                                        prevValue={prevValue?.health?.focal_point_phone_number}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                </>
                            )}
                            {value.type !== TYPE_HEALTH_CARE && (
                                <>
                                    <TextInput
                                        required
                                        label={strings.focalPersonLocal}
                                        name="focal_person_loc"
                                        value={value.focal_person_loc}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.focal_person_loc}
                                        prevValue={prevValue?.focal_person_loc}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        name="source_en"
                                        label={strings.sourceEn}
                                        value={value.source_en}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.source_en}
                                        prevValue={prevValue?.source_en}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <TextInput
                                        name="source_loc"
                                        label={strings.sourceLocal}
                                        value={value.source_loc}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.source_loc}
                                        prevValue={prevValue?.source_loc}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                </>
                            )}
                            {value.type === TYPE_HEALTH_CARE && (
                                <>
                                    <SelectInput
                                        label={strings.affiliation}
                                        required
                                        name="affiliation"
                                        options={localUnitsOptions?.affiliation}
                                        value={value.health?.affiliation}
                                        onChange={setHealthFieldValue}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.affiliation}
                                        prevValue={prevValue?.health?.affiliation}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    {value.health?.affiliation === OTHER_AFFILIATION && (
                                        <TextInput
                                            label={strings.otherAffiliation}
                                            name="other_affiliation"
                                            value={value.health?.other_affiliation}
                                            onChange={setHealthFieldValue}
                                            readOnly={readOnly}
                                            error={healthFormError?.other_affiliation}
                                            prevValue={prevValue?.health?.other_affiliation}
                                            withPrevValue={withPrevValue}
                                            withDiffView={withDiffView}
                                        />
                                    )}
                                    <SelectInput
                                        required
                                        label={strings.functionality}
                                        name="functionality"
                                        options={localUnitsOptions?.functionality}
                                        value={value.health?.functionality}
                                        onChange={setHealthFieldValue}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.functionality}
                                        prevValue={prevValue?.health?.functionality}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                </>

                            )}
                        </ListView>
                        <ListView layout="block">
                            <CountrySelectInput
                                required
                                label={strings.country}
                                name="country"
                                value={value.country}
                                onChange={setFieldValue}
                                readOnly
                                prevValue={prevValue?.country}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <ListView spacing="sm">
                                <TextInput
                                    name="address_en"
                                    label={strings.addressEn}
                                    value={value.address_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_en}
                                    prevValue={prevValue?.address_en}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                                <TextInput
                                    name="address_loc"
                                    label={strings.addressLocal}
                                    value={value.address_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_loc}
                                    prevValue={prevValue?.address_loc}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            </ListView>
                            <ListView spacing="sm">
                                <TextInput
                                    label={strings.localityEn}
                                    name="city_en"
                                    value={value.city_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_en}
                                    prevValue={prevValue?.city_en}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                                <TextInput
                                    label={strings.localityLocal}
                                    name="city_loc"
                                    value={value.city_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_loc}
                                    prevValue={prevValue?.city_loc}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            </ListView>
                            <NonFieldError error={error?.location_json} />
                            <BaseMapPointInput
                                country={Number(countryId)}
                                name="location_json"
                                value={value.location_json}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorObject(error?.location_json)}
                                required
                                prevValue={prevValue?.location_json}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                        </ListView>
                    </ListView>
                </Container>
                {value.type === TYPE_HEALTH_CARE && (
                    <HealthFields
                        value={value?.health}
                        prevValue={prevValue?.health}
                        error={healthFormError}
                        setFieldValue={setHealthFieldValue}
                        readOnly={readOnly}
                        localUnitOptions={localUnitsOptions}
                        withDiffView={withDiffView}
                        withPrevValue={withPrevValue}
                    />
                )}
            </ListView>
            {showSubmitConfirmation && (
                <LocalUnitViewModal
                    onClose={handleCancelButtonClick}
                    footerActions={submitButton}
                    localUnitId={localUnitId}
                    locallyChangedValue={value}
                >
                    <TextArea
                        name="update_reason_overview"
                        required
                        label={strings.updateReasonOverviewLabel}
                        value={updateReason}
                        onChange={setUpdateReason}
                    />
                </LocalUnitViewModal>
            )}
            {showValidateModal && isDefined(localUnitId) && (
                <LocalUnitValidateModal
                    localUnitId={localUnitId}
                    localUnitName={localUnitName}
                    onClose={setShowValidateModalFalse}
                    onActionSuccess={handleLocalUnitValidate}
                />
            )}
        </Modal>
    );
}

export default LocalUnitsFormModal;
