import {
    type RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BooleanInput,
    Button,
    Checklist,
    Container,
    DateInput,
    DateOutput,
    MultiSelectInput,
    NumberInput,
    Portal,
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
    injectClientId,
    numericIdSelector,
    resolveToComponent,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    getErrorString,
    useForm,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import DiffWrapper from '#components/DiffWrapper';
import BaseMapPointInput from '#components/domain/BaseMapPointInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import MultiSelectDiffWrapper from '#components/MultiSelectDiffWrapper';
import NonFieldError from '#components/NonFieldError';
import SelectDiffWrapper from '#components/SelectDiffWrapper';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import { getFirstTruthyString } from '#utils/common';
import {
    AMBULANCE_TYPE,
    HOSPITAL_TYPE,
    OTHER_AFFILIATION,
    OTHER_TRAINING_FACILITIES,
    OTHER_TYPE,
    PRIMARY_HEALTH_TYPE,
    RESIDENTIAL_TYPE,
    SPECIALIZED_SERVICES_TYPE,
    TRAINING_FACILITY_TYPE,
    VISIBILITY_PUBLIC,
} from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    EXTERNALLY_MANAGED,
    injectClientIdToResponse,
    UNVALIDATED,
    VALIDATED,
} from '../../common';
import FormGrid from '../../FormGrid';
import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitStatus from '../../LocalUnitStatus';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import LocalUnitValidateModal from '../../LocalUnitValidateModal';
import LocalUnitViewModal from '../../LocalUnitViewModal';
import OtherProfilesInput from './OtherProfilesInput';
import schema, {
    type LocalUnitsRequestPostBody,
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HealthLocalUnitFormFields = NonNullable<PartialLocalUnits['health']>;
type OtherProfilesFormFields = NonNullable<HealthLocalUnitFormFields['other_profiles']>[number];
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]
type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;

const visibilityKeySelector = (option: VisibilityOptions) => option.key;

const defaultHealthValue = {};

interface FormColumnContainerProps {
    children: React.ReactNode;
}

function FormColumnContainer(props: FormColumnContainerProps) {
    const { children } = props;

    return (
        <Container
            contentViewType="vertical"
            spacing="comfortable"
        >
            {children}
        </Container>
    );
}

interface Props {
    readOnly?: boolean;
    onSuccess?: () => void;
    onEditButtonClick?: () => void;
    onDeleteActionSuccess?: () => void;
    localUnitId?: number;
    actionsContainerRef: RefObject<HTMLDivElement>;
    headingDescriptionRef?: RefObject<HTMLDivElement>;
    headerDescriptionRef: RefObject<HTMLDivElement>;
}

function LocalUnitsForm(props: Props) {
    const {
        readOnly: readOnlyFromProps = false,
        onSuccess,
        onEditButtonClick,
        localUnitId,
        actionsContainerRef,
        headingDescriptionRef,
        headerDescriptionRef,
        onDeleteActionSuccess,
    } = props;

    const { isAuthenticated } = useAuth();

    const {
        isSuperUser,
        isCountryAdmin,
        isRegionAdmin,
        isLocalUnitGlobalValidatorByType,
        isLocalUnitRegionValidatorByType,
        isLocalUnitCountryValidatorByType,
    } = usePermissions();

    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();

    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const [updateReason, setUpdateReason] = useState<string>();

    const [showChangesModal, {
        setTrue: setShowChangesModalTrue,
        setFalse: setShowChangesModalFalse,
    }] = useBooleanState(false);

    const alert = useAlert();
    const strings = useTranslation(i18n);
    const formFieldsContainerRef = useRef<HTMLDivElement>(null);

    const [showValueChanges, setShowValueChanges] = useState(false);

    const [
        showDeleteLocalUnitModal,
        {
            setTrue: setShowDeleteLocalUnitModalTrue,
            setFalse: setShowDeleteLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

    const [
        showValidateLocalUnitModal,
        {
            setTrue: setShowValidateLocalUnitModalTrue,
            setFalse: setShowValidateLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

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

    const onHealthFieldChange = useFormObject<'health', HealthLocalUnitFormFields>(
        'health',
        setFieldValue,
        defaultHealthValue,
    );

    const {
        setValue: onOtherProfilesChanges,
        removeValue: onOtherProfilesRemove,
    } = useFormArray<'other_profiles', OtherProfilesFormFields>(
        'other_profiles',
        onHealthFieldChange,
    );

    const {
        response: localUnitDetailsResponse,
        pending: localUnitDetailsPending,
        error: localUnitDetailsError,
    } = useRequest({
        skip: isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        onSuccess: (response) => {
            const responseWithClientId = injectClientIdToResponse(response);

            if (isDefined(responseWithClientId)) {
                setValue(responseWithClientId);
            }
        },
    });

    const {
        response: localUnitPreviousResponse,
    } = useRequest({
        skip: isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/latest-change-request/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

    const {
        response: externallyManagedLocalUnitsResponse,
    } = useRequest({
        url: '/api/v2/externally-managed-local-unit/',
        query: {
            country__id: countryResponse?.id,
            limit: 9999,
        },
    });

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

    const isEditable = localUnitDetailsResponse?.status === VALIDATED;

    const isNewlyCreated = localUnitDetailsResponse?.status === UNVALIDATED;
    const isExternallyManaged = localUnitDetailsResponse?.status === EXTERNALLY_MANAGED;
    const isExternallyManagedType = isDefined(value.type)
        ? !!(externallyManagedByLocalUnitType?.[value.type])
        : false;

    const readOnly = readOnlyFromProps || isExternallyManaged || isExternallyManagedType;

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
        onSuccess: (response) => {
            if (isNotDefined(localUnitId)) {
                setFieldValue(response.type[0]?.code, 'type');
            }
        },
    });

    const {
        pending: addLocalUnitsPending,
        trigger: addLocalUnit,
    } = useLazyRequest({
        url: '/api/v2/local-units/',
        method: 'POST',
        body: (formFields: LocalUnitsRequestPostBody) => formFields,
        onSuccess: () => {
            if (onSuccess) {
                onSuccess();
            }
            alert.show(
                strings.successMessage,
                { variant: 'success' },
            );
        },
        onFailure: (response) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
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
                    debugMessage,
                },
            );

            // formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
        },
    });

    const {
        pending: updateLocalUnitsPending,
        trigger: updateLocalUnit,
    } = useLazyRequest({
        method: 'PATCH',
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        body: (formFields: LocalUnitsRequestPostBody) => formFields,
        onSuccess: () => {
            if (onSuccess) {
                onSuccess();
            }
            alert.show(
                strings.updateMessage,
                { variant: 'success' },
            );
        },
        onFailure: (response) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
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
                    debugMessage,
                },
            );

            // formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
            setShowChangesModalFalse();
        },
    });

    const hasValidatePermission = isAuthenticated && (
        isSuperUser
        || isLocalUnitGlobalValidatorByType(value.type)
        || isLocalUnitCountryValidatorByType(countryResponse?.id, value.type)
        || isLocalUnitRegionValidatorByType(countryResponse?.region, value.type)
    );

    const hasUpdatePermission = isCountryAdmin(countryResponse?.id)
        || isRegionAdmin(countryResponse?.region)
        || hasValidatePermission;

    const hasDeletePermission = isCountryAdmin(countryResponse?.id)
        || hasValidatePermission;

    const handleFormSubmit = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                // formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
                return;
            }

            if (isDefined(localUnitId)) {
                const finalValue = {
                    ...result.value,
                    update_reason_overview: updateReason,
                };
                updateLocalUnit(finalValue as LocalUnitsRequestPostBody);
            } else {
                addLocalUnit(result.value as LocalUnitsRequestPostBody);
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

    const onDoneButtonClick = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                // formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
                return;
            }
            setShowChangesModalTrue();
        },
        [
            setError,
            validate,
            setShowChangesModalTrue,
        ],
    );

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);

    const previousData = (
        localUnitPreviousResponse?.previous_data_details as unknown as LocalUnitResponse | undefined
    );

    const diffViewEnabled = showValueChanges
        && !isNewlyCreated
        && !isEditable
        && !isExternallyManagedType
        && !isExternallyManaged;

    const showViewChangesButton = !isNewlyCreated
        && isDefined(localUnitId)
        && !isEditable
        && !isExternallyManaged;

    const isOtherTrainingFacility = useMemo(() => {
        if (isNotDefined(value.health?.professional_training_facilities)) {
            return false;
        }
        return value.health?.professional_training_facilities?.some(
            (facility) => facility === OTHER_TRAINING_FACILITIES,
        );
    }, [value.health?.professional_training_facilities]);

    const handleOtherProfilesAddButtonClick = useCallback(
        () => {
            const newOtherProfiles: OtherProfilesFormFields = {
                client_id: randomString(),
            };

            onHealthFieldChange(
                (oldValue: OtherProfilesFormFields[] | undefined) => (
                    [...(oldValue ?? []), newOtherProfiles]
                ),
                'other_profiles' as const,
            );
        },
        [onHealthFieldChange],
    );

    const otherErrors = useMemo(() => {
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
        localUnitId,
        isExternallyManaged,
        isExternallyManagedType,
        hasUpdatePermission,
        strings.noPermissionFormUpdateExternallyManaged,
        strings.noLocalUnitAddPermission,
        strings.noLocalUnitEditPermission,
        strings.noPermissionFormExternallyManaged,
    ]);

    const getPreviousProfileValue = useCallback((profileClientId: string) => (
        previousData?.health?.other_profiles?.find(
            (previousProfile) => injectClientId(previousProfile)?.client_id === profileClientId,
        )
    ), [previousData]);

    const submitButton = readOnly ? null : (
        <Button
            name={undefined}
            onClick={handleFormSubmit}
            disabled={
                addLocalUnitsPending
                || updateLocalUnitsPending
                || !hasUpdatePermission
                || isExternallyManaged
                || isExternallyManagedType
                || (isDefined(localUnitId) && isNotDefined(updateReason))
            }
        >
            {strings.submitButtonLabel}
        </Button>
    );

    return (
        <div className={styles.localUnitsForm}>
            {isDefined(actionsContainerRef.current) && environment !== 'production' && (
                <Portal container={actionsContainerRef.current}>
                    {isDefined(localUnitDetailsResponse) && (
                        <>
                            {hasDeletePermission && (
                                <Button
                                    name={undefined}
                                    onClick={setShowDeleteLocalUnitModalTrue}
                                    variant="secondary"
                                >
                                    {strings.localUnitDeleteButtonLabel}
                                </Button>
                            )}
                            {hasValidatePermission && (
                                <LocalUnitValidateButton
                                    onClick={setShowValidateLocalUnitModalTrue}
                                    status={localUnitDetailsResponse.status}
                                    hasValidatePermission={hasValidatePermission}
                                />
                            )}
                            {readOnlyFromProps
                                && isEditable
                                && hasUpdatePermission && (
                                <Button
                                    name={undefined}
                                    onClick={onEditButtonClick}
                                >
                                    {strings.editButtonLabel}
                                </Button>
                            )}
                        </>
                    )}
                    {!readOnly && isNotDefined(localUnitId) && submitButton}
                    {!readOnly && isDefined(localUnitId) && (
                        <Button
                            name={undefined}
                            onClick={onDoneButtonClick}
                            disabled={!hasUpdatePermission}
                        >
                            {strings.doneButtonLabel}
                        </Button>
                    )}
                </Portal>
            )}
            {isDefined(headingDescriptionRef)
                && isDefined(headingDescriptionRef.current)
                && isDefined(localUnitId)
                && (
                    <Portal container={headingDescriptionRef.current}>
                        <div className={styles.headerDescription}>
                            <LocalUnitStatus
                                value={localUnitDetailsResponse?.status}
                                valueDisplay={localUnitDetailsResponse?.status_details}
                            />
                            <div className={styles.lastUpdateLabel}>
                                {resolveToComponent(
                                    strings.lastUpdateLabel,
                                    {
                                        modifiedAt: (
                                            <DateOutput
                                                value={localUnitDetailsResponse?.modified_at}
                                            />
                                        ),
                                        modifiedBy: getUserName(
                                            localUnitDetailsResponse?.modified_by_details,
                                        ),
                                    },
                                )}
                            </div>
                        </div>
                    </Portal>
                )}
            {isDefined(headerDescriptionRef.current) && (
                <Portal container={headerDescriptionRef.current}>
                    <FormGrid>
                        <SelectDiffWrapper
                            showPreviousValue={showValueChanges}
                            enabled={diffViewEnabled}
                            oldValue={previousData?.type}
                            value={value.type}
                            options={localUnitsOptions?.type}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <SelectInput
                                inputSectionClassName={styles.inputSection}
                                label={strings.type}
                                required
                                name="type"
                                options={localUnitsOptions?.type}
                                value={value.type}
                                onChange={setFieldValue}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnlyFromProps || isEditable}
                                error={error?.type}
                                nonClearable
                            />
                        </SelectDiffWrapper>
                        <FormGrid>
                            <SelectDiffWrapper
                                showPreviousValue={showValueChanges}
                                enabled={diffViewEnabled}
                                oldValue={previousData?.visibility}
                                value={value.visibility}
                                options={visibilityOptions}
                                keySelector={visibilityKeySelector}
                                labelSelector={stringValueSelector}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <SelectInput
                                    inputSectionClassName={styles.inputSection}
                                    label={strings.visibility}
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
                            </SelectDiffWrapper>
                            {showViewChangesButton && (
                                <Switch
                                    className={styles.toggleViewChanges}
                                    name="valueChanges"
                                    label={strings.viewChangesLabel}
                                    value={showValueChanges}
                                    onChange={setShowValueChanges}
                                />
                            )}
                        </FormGrid>
                    </FormGrid>
                </Portal>
            )}
            {/* Address and Contact */}
            <NonFieldError
                error={formError}
                withFallbackError
            />
            {isDefined(otherErrors) && (
                <NonFieldError error={otherErrors} />
            )}
            <Container
                heading={strings.addressAndContactTitle}
                withHeaderBorder
                containerRef={formFieldsContainerRef}
                footerActionsContainerClassName={styles.footerActions}
                footerActions={!readOnly && isNotDefined(actionsContainerRef) && submitButton}
                contentViewType="vertical"
                pending={localUnitDetailsPending || localUnitsOptionsPending}
                errored={isDefined(localUnitId) && isDefined(localUnitDetailsError)}
                errorMessage={localUnitDetailsError?.value.messageForNotification}
            >
                <FormGrid>
                    <FormColumnContainer>
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.date_of_data}
                            previousValue={previousData?.date_of_data}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <DateInput
                                required
                                inputSectionClassName={styles.inputSection}
                                name="date_of_data"
                                label={strings.dateOfUpdate}
                                value={value.date_of_data}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.date_of_data}
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.subtype}
                            previousValue={previousData?.subtype}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.inputSection}
                                label={strings.subtype}
                                placeholder={strings.subtypeDescription}
                                name="subtype"
                                value={value.subtype}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.subtype}
                            />
                        </DiffWrapper>
                        {value.type !== TYPE_HEALTH_CARE && (
                            <SelectDiffWrapper
                                showPreviousValue={showValueChanges}
                                value={value.level}
                                oldValue={previousData?.level}
                                enabled={diffViewEnabled}
                                options={localUnitsOptions?.level}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <SelectInput
                                    inputSectionClassName={styles.inputSection}
                                    label={strings.coverage}
                                    name="level"
                                    options={localUnitsOptions?.level}
                                    value={value.level}
                                    onChange={setFieldValue}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={readOnly}
                                    error={error?.level}
                                />
                            </SelectDiffWrapper>
                        )}
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.english_branch_name}
                            previousValue={previousData?.english_branch_name}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.inputSection}
                                label={strings.localUnitNameEn}
                                name="english_branch_name"
                                value={value.english_branch_name}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.english_branch_name}
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.local_branch_name}
                            previousValue={previousData?.local_branch_name}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.inputSection}
                                name="local_branch_name"
                                required
                                label={strings.localUnitNameLocal}
                                value={value.local_branch_name}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.local_branch_name}
                            />
                        </DiffWrapper>
                        {value.type !== TYPE_HEALTH_CARE && (
                            <>
                                {hasUpdatePermission && (
                                    <>
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.phone}
                                            previousValue={previousData?.phone}
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <TextInput
                                                inputSectionClassName={styles.inputSection}
                                                label={strings.phone}
                                                name="phone"
                                                value={value.phone}
                                                onChange={setFieldValue}
                                                readOnly={readOnly}
                                                error={error?.phone}
                                            />
                                        </DiffWrapper>
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.email}
                                            previousValue={previousData?.email}
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <TextInput
                                                inputSectionClassName={styles.inputSection}
                                                label={strings.email}
                                                name="email"
                                                value={value.email}
                                                onChange={setFieldValue}
                                                readOnly={readOnly}
                                                error={error?.email}
                                            />
                                        </DiffWrapper>
                                    </>
                                )}
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.link}
                                    previousValue={previousData?.link}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.website}
                                        name="link"
                                        value={value.link}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.link}
                                    />
                                </DiffWrapper>
                            </>
                        )}
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.postcode}
                            previousValue={previousData?.postcode}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.inputSection}
                                label={strings.postCode}
                                name="postcode"
                                value={value.postcode}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.postcode}
                            />
                        </DiffWrapper>
                        {value.type === TYPE_HEALTH_CARE && (
                            hasUpdatePermission && (
                                <>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.focal_person_loc}
                                        previousValue={previousData?.focal_person_loc}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.inputSection}
                                            required
                                            label={strings.focalPersonLocal}
                                            name="focal_person_loc"
                                            value={value.focal_person_loc}
                                            onChange={setFieldValue}
                                            readOnly={readOnly}
                                            error={error?.focal_person_loc}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.focal_person_en}
                                        previousValue={previousData?.focal_person_en}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.inputSection}
                                            name="focal_person_en"
                                            label={strings.focalPersonEn}
                                            value={value.focal_person_en}
                                            onChange={setFieldValue}
                                            readOnly={readOnly}
                                            error={error?.focal_person_en}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.focal_point_position}
                                        previousValue={
                                            previousData?.health?.focal_point_position
                                        }
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            required
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.focalPointPosition}
                                            name="focal_point_position"
                                            value={value.health?.focal_point_position}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.focal_point_position}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.focal_point_email}
                                        previousValue={previousData
                                            ?.health?.focal_point_email}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.focalPointEmail}
                                            required
                                            name="focal_point_email"
                                            value={value.health?.focal_point_email}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.focal_point_email}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.focal_point_phone_number}
                                        previousValue={
                                            previousData?.health?.focal_point_phone_number
                                        }
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.focalPointPhoneNumber}
                                            name="focal_point_phone_number"
                                            value={value.health?.focal_point_phone_number}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={
                                                healthFormError?.focal_point_phone_number
                                            }
                                        />
                                    </DiffWrapper>
                                </>
                            )
                        )}
                        {value.type !== TYPE_HEALTH_CARE && (
                            <>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.source_en}
                                    previousValue={previousData?.source_en}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.inputSection}
                                        name="source_en"
                                        label={strings.sourceEn}
                                        value={value.source_en}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.source_en}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.source_loc}
                                    previousValue={previousData?.source_loc}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.inputSection}
                                        name="source_loc"
                                        label={strings.sourceLocal}
                                        value={value.source_loc}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.source_loc}
                                    />
                                </DiffWrapper>
                            </>
                        )}
                        {value.type === TYPE_HEALTH_CARE && (
                            <>
                                <SelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.affiliation}
                                    oldValue={previousData?.health?.affiliation}
                                    enabled={diffViewEnabled}
                                    diffContainerClassName={styles.diffContainer}
                                    options={localUnitsOptions?.affiliation}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.affiliation}
                                        required
                                        name="affiliation"
                                        options={localUnitsOptions?.affiliation}
                                        value={value.health?.affiliation}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.affiliation}
                                    />
                                </SelectDiffWrapper>
                                {value.health?.affiliation === OTHER_AFFILIATION && (
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.other_affiliation}
                                        previousValue={previousData?.health?.other_affiliation}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.otherAffiliation}
                                            name="other_affiliation"
                                            value={value.health?.other_affiliation}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.other_affiliation}
                                        />
                                    </DiffWrapper>
                                )}
                                <SelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.functionality}
                                    oldValue={previousData?.health?.functionality}
                                    enabled={diffViewEnabled}
                                    diffContainerClassName={styles.diffContainer}
                                    options={localUnitsOptions?.functionality}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.inputSection}
                                        required
                                        label={strings.functionality}
                                        name="functionality"
                                        options={localUnitsOptions?.functionality}
                                        value={value.health?.functionality}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.functionality}
                                    />
                                </SelectDiffWrapper>
                            </>
                        )}
                    </FormColumnContainer>
                    <FormColumnContainer>
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.country}
                            previousValue={previousData?.country}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <CountrySelectInput
                                inputSectionClassName={styles.inputSection}
                                required
                                label={strings.country}
                                name="country"
                                value={value.country}
                                onChange={setFieldValue}
                                readOnly
                            />
                        </DiffWrapper>
                        <div className={styles.addressInput}>
                            <DiffWrapper
                                showPreviousValue={showValueChanges}
                                value={value.address_en}
                                previousValue={previousData?.address_en}
                                diffViewEnabled={diffViewEnabled}
                                className={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.inputSection}
                                    name="address_en"
                                    label={strings.addressEn}
                                    value={value.address_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_en}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                showPreviousValue={showValueChanges}
                                value={value.address_loc}
                                previousValue={previousData?.address_loc}
                                diffViewEnabled={diffViewEnabled}
                                className={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.inputSection}
                                    name="address_loc"
                                    label={strings.addressLocal}
                                    value={value.address_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_loc}
                                />
                            </DiffWrapper>
                        </div>
                        <div className={styles.addressInput}>
                            <DiffWrapper
                                showPreviousValue={showValueChanges}
                                value={value.city_en}
                                previousValue={previousData?.city_en}
                                diffViewEnabled={diffViewEnabled}
                                className={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.inputSection}
                                    label={strings.localityEn}
                                    name="city_en"
                                    value={value.city_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_en}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                showPreviousValue={showValueChanges}
                                value={value.city_loc}
                                previousValue={previousData?.city_loc}
                                diffViewEnabled={diffViewEnabled}
                                className={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.inputSection}
                                    label={strings.localityLocal}
                                    name="city_loc"
                                    value={value.city_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_loc}
                                />
                            </DiffWrapper>
                        </div>
                        <NonFieldError
                            error={error?.location_json}
                        />
                        <BaseMapPointInput
                            diffWrapperClassName={styles.diffContainer}
                            latitudeInputSectionClassName={styles.inputSection}
                            longitudeInputSectionClassName={styles.inputSection}
                            country={Number(countryId)}
                            name="location_json"
                            mapContainerClassName={styles.pointInputMap}
                            value={value.location_json}
                            previousValue={previousData?.location_json}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={getErrorObject(error?.location_json)}
                            showChanges={diffViewEnabled}
                            showPreviousValue={showValueChanges}
                            required
                        />
                    </FormColumnContainer>
                </FormGrid>
            </Container>
            {/* Specialities and Capacity */}
            {value.type === TYPE_HEALTH_CARE && (
                <>
                    <Container
                        heading={strings.specialitiesAndCapacityTitle}
                        withHeaderBorder
                        contentViewType="vertical"
                        headerDescription={(
                            <NonFieldError
                                error={error?.health}
                            />
                        )}
                    >
                        <FormGrid>
                            <FormColumnContainer>
                                <SelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.health_facility_type}
                                    oldValue={previousData?.health?.health_facility_type}
                                    enabled={diffViewEnabled}
                                    diffContainerClassName={styles.diffContainer}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    options={localUnitsOptions?.health_facility_type}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.healthFacilityType}
                                        required
                                        name="health_facility_type"
                                        options={localUnitsOptions?.health_facility_type}
                                        value={value.health?.health_facility_type}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.health_facility_type}
                                    />
                                </SelectDiffWrapper>
                                {value.health?.health_facility_type === OTHER_TYPE && (
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.other_facility_type}
                                        previousValue={previousData?.health
                                            ?.other_facility_type}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            required
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.otherFacilityType}
                                            name="other_facility_type"
                                            value={value.health?.other_facility_type}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.other_facility_type}
                                        />
                                    </DiffWrapper>
                                )}
                                {value?.health
                                    ?.health_facility_type === PRIMARY_HEALTH_TYPE && (
                                    <SelectDiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.primary_health_care_center}
                                        oldValue={previousData?.health
                                            ?.primary_health_care_center}
                                        enabled={diffViewEnabled}
                                        diffContainerClassName={styles.diffContainer}
                                        options={localUnitsOptions?.primary_health_care_center}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                    >
                                        <SelectInput
                                            required
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.primaryHealthCareCenter}
                                            name="primary_health_care_center"
                                            options={localUnitsOptions
                                                ?.primary_health_care_center}
                                            value={value.health?.primary_health_care_center}
                                            onChange={onHealthFieldChange}
                                            keySelector={numericIdSelector}
                                            labelSelector={stringNameSelector}
                                            readOnly={readOnly}
                                            error={healthFormError?.primary_health_care_center}
                                        />
                                    </SelectDiffWrapper>
                                )}
                                {value.health
                                    ?.health_facility_type === SPECIALIZED_SERVICES_TYPE && (
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.speciality}
                                        previousValue={previousData?.health?.speciality}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <TextInput
                                            required
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.specialities}
                                            name="speciality"
                                            value={value.health?.speciality}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.speciality}
                                        />
                                    </DiffWrapper>
                                )}
                                {value?.health?.health_facility_type === HOSPITAL_TYPE && (
                                    <SelectDiffWrapper
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        options={localUnitsOptions?.hospital_type}
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.hospital_type}
                                        oldValue={previousData?.health?.hospital_type}
                                        enabled={diffViewEnabled}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <SelectInput
                                            inputSectionClassName={styles.inputSection}
                                            label={strings.hospitalType}
                                            name="hospital_type"
                                            options={localUnitsOptions?.hospital_type}
                                            value={value.health?.hospital_type}
                                            onChange={onHealthFieldChange}
                                            keySelector={numericIdSelector}
                                            labelSelector={stringNameSelector}
                                            readOnly={readOnly}
                                            error={healthFormError?.hospital_type}
                                        />
                                    </SelectDiffWrapper>
                                )}
                                {value.health?.health_facility_type === AMBULANCE_TYPE && (
                                    <>
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.health?.ambulance_type_a}
                                            previousValue={
                                                previousData?.health?.ambulance_type_a
                                            }
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <NumberInput
                                                inputSectionClassName={styles.inputSection}
                                                label={strings.ambulanceTypeA}
                                                name="ambulance_type_a"
                                                value={value.health?.ambulance_type_a}
                                                onChange={onHealthFieldChange}
                                                readOnly={readOnly}
                                                error={getErrorString(
                                                    healthFormError?.ambulance_type_a,
                                                )}
                                            />
                                        </DiffWrapper>
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.health?.ambulance_type_b}
                                            previousValue={
                                                previousData?.health?.ambulance_type_b
                                            }
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <NumberInput
                                                inputSectionClassName={styles.inputSection}
                                                label={strings.ambulanceTypeB}
                                                name="ambulance_type_b"
                                                value={value.health?.ambulance_type_b}
                                                onChange={onHealthFieldChange}
                                                readOnly={readOnly}
                                                error={getErrorString(
                                                    healthFormError?.ambulance_type_b,
                                                )}
                                            />
                                        </DiffWrapper>
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.health?.ambulance_type_c}
                                            previousValue={
                                                previousData?.health?.ambulance_type_c
                                            }
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <NumberInput
                                                inputSectionClassName={styles.inputSection}
                                                label={strings.ambulanceTypeC}
                                                name="ambulance_type_c"
                                                value={value.health?.ambulance_type_c}
                                                onChange={onHealthFieldChange}
                                                readOnly={readOnly}
                                                error={getErrorString(
                                                    healthFormError?.ambulance_type_c,
                                                )}
                                            />
                                        </DiffWrapper>
                                    </>
                                )}
                                {value.health
                                    ?.health_facility_type === TRAINING_FACILITY_TYPE && (
                                    <>
                                        <MultiSelectDiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.health?.professional_training_facilities}
                                            oldValue={previousData?.health
                                                ?.professional_training_facilities}
                                            enabled={diffViewEnabled}
                                            diffContainerClassName={styles.diffContainer}
                                            keySelector={numericIdSelector}
                                            labelSelector={stringNameSelector}
                                            options={localUnitsOptions
                                                ?.professional_training_facilities}
                                        >
                                            <Checklist
                                                className={styles.inputSection}
                                                label={strings.professionalTrainingFacilities}
                                                name="professional_training_facilities"
                                                options={localUnitsOptions
                                                    ?.professional_training_facilities}
                                                value={value.health
                                                    ?.professional_training_facilities}
                                                onChange={onHealthFieldChange}
                                                keySelector={numericIdSelector}
                                                labelSelector={stringNameSelector}
                                                readOnly={readOnly}
                                                error={getErrorString(
                                                    healthFormError
                                                        ?.professional_training_facilities,
                                                )}
                                            />
                                        </MultiSelectDiffWrapper>
                                        {isOtherTrainingFacility && (
                                            <DiffWrapper
                                                showPreviousValue={showValueChanges}
                                                value={value.health?.other_training_facilities}
                                                previousValue={previousData?.health
                                                    ?.other_training_facilities}
                                                diffViewEnabled={diffViewEnabled}
                                                className={styles.diffContainer}
                                            >
                                                <TextInput
                                                    name="other_training_facilities"
                                                    label={strings.otherTrainingFacilities}
                                                    value={value.health?.other_training_facilities}
                                                    onChange={onHealthFieldChange}
                                                    readOnly={readOnly}
                                                    error={healthFormError
                                                        ?.other_training_facilities}
                                                />
                                            </DiffWrapper>
                                        )}
                                    </>
                                )}
                            </FormColumnContainer>
                            <FormColumnContainer>
                                <MultiSelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.general_medical_services}
                                    oldValue={previousData?.health?.general_medical_services}
                                    enabled={diffViewEnabled}
                                    options={localUnitsOptions?.general_medical_services}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <MultiSelectInput
                                        inputSectionClassName={styles.inputSection}
                                        required
                                        label={strings.generalMedicalServices}
                                        name="general_medical_services"
                                        options={localUnitsOptions?.general_medical_services}
                                        value={value.health?.general_medical_services}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.general_medical_services,
                                        )}
                                    />
                                </MultiSelectDiffWrapper>
                                <MultiSelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={
                                        value.health?.specialized_medical_beyond_primary_level
                                    }
                                    oldValue={
                                        previousData
                                            ?.health?.specialized_medical_beyond_primary_level
                                    }
                                    enabled={diffViewEnabled}
                                    options={localUnitsOptions
                                        ?.specialized_medical_beyond_primary_level}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <MultiSelectInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.specializedMedicalService}
                                        required
                                        name="specialized_medical_beyond_primary_level"
                                        options={localUnitsOptions
                                            ?.specialized_medical_beyond_primary_level}
                                        value={value.health
                                            ?.specialized_medical_beyond_primary_level}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError
                                                ?.specialized_medical_beyond_primary_level,
                                        )}
                                    />
                                </MultiSelectDiffWrapper>
                                <MultiSelectDiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.blood_services}
                                    oldValue={previousData?.health?.blood_services}
                                    enabled={diffViewEnabled}
                                    diffContainerClassName={styles.diffContainer}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    options={localUnitsOptions?.blood_services}
                                >
                                    <MultiSelectInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.bloodServices}
                                        required
                                        name="blood_services"
                                        options={localUnitsOptions?.blood_services}
                                        value={value.health?.blood_services}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={getErrorString(healthFormError?.blood_services)}
                                    />
                                </MultiSelectDiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.other_services}
                                    previousValue={previousData?.health?.other_services}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.otherServices}
                                        name="other_services"
                                        value={value.health?.other_services}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_services}
                                    />
                                </DiffWrapper>
                            </FormColumnContainer>
                        </FormGrid>
                        <Container
                            heading={strings.qualifiersTitle}
                        >
                            <FormGrid>
                                <FormColumnContainer>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.is_warehousing}
                                        previousValue={previousData?.health?.is_warehousing}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <BooleanInput
                                            className={styles.inputSection}
                                            clearable
                                            label={strings.warehousing}
                                            name="is_warehousing"
                                            value={value.health?.is_warehousing}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={getErrorString(
                                                healthFormError?.is_warehousing,
                                            )}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.is_cold_chain}
                                        previousValue={previousData?.health?.is_cold_chain}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <BooleanInput
                                            className={styles.inputSection}
                                            clearable
                                            label={strings.coldChain}
                                            name="is_cold_chain"
                                            value={value.health?.is_cold_chain}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={getErrorString(
                                                healthFormError?.is_cold_chain,
                                            )}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        showPreviousValue={showValueChanges}
                                        value={value.health?.other_medical_heal}
                                        previousValue={previousData?.health?.other_medical_heal}
                                        diffViewEnabled={diffViewEnabled}
                                        className={styles.diffContainer}
                                    >
                                        <BooleanInput
                                            className={styles.inputSection}
                                            clearable
                                            label={strings.otherMedicalHeal}
                                            name="other_medical_heal"
                                            value={value.health?.other_medical_heal}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={getErrorString(
                                                healthFormError?.other_medical_heal,
                                            )}
                                        />
                                    </DiffWrapper>
                                </FormColumnContainer>
                                <FormColumnContainer>
                                    {value?.health?.health_facility_type === HOSPITAL_TYPE && (
                                        <DiffWrapper
                                            showPreviousValue={showValueChanges}
                                            value={value.health?.is_teaching_hospital}
                                            previousValue={
                                                previousData?.health?.is_teaching_hospital
                                            }
                                            diffViewEnabled={diffViewEnabled}
                                            className={styles.diffContainer}
                                        >
                                            <BooleanInput
                                                className={styles.inputSection}
                                                required
                                                label={strings.teachingHospital}
                                                name="is_teaching_hospital"
                                                value={value.health?.is_teaching_hospital}
                                                onChange={onHealthFieldChange}
                                                readOnly={readOnly}
                                                error={healthFormError?.is_teaching_hospital}
                                            />
                                        </DiffWrapper>
                                    )}
                                    {(value?.health?.health_facility_type === HOSPITAL_TYPE
                                        || value?.health
                                            ?.health_facility_type === PRIMARY_HEALTH_TYPE
                                        || value?.health
                                            ?.health_facility_type === SPECIALIZED_SERVICES_TYPE
                                        || value?.health
                                            ?.health_facility_type === RESIDENTIAL_TYPE
                                        || value?.health
                                            ?.health_facility_type === OTHER_TYPE
                                    ) && (
                                        <>
                                            <DiffWrapper
                                                showPreviousValue={showValueChanges}
                                                value={value.health?.is_in_patient_capacity}
                                                previousValue={
                                                    previousData?.health?.is_in_patient_capacity
                                                }
                                                diffViewEnabled={diffViewEnabled}
                                                className={styles.diffContainer}
                                            >
                                                <BooleanInput
                                                    className={styles.inputSection}
                                                    required
                                                    label={strings.inPatientCapacity}
                                                    name="is_in_patient_capacity"
                                                    value={value.health?.is_in_patient_capacity}
                                                    onChange={onHealthFieldChange}
                                                    readOnly={readOnly}
                                                    error={healthFormError?.is_in_patient_capacity}
                                                />
                                            </DiffWrapper>
                                            {value.health?.is_in_patient_capacity && (
                                                <DiffWrapper
                                                    showPreviousValue={showValueChanges}
                                                    value={value.health?.maximum_capacity}
                                                    previousValue={
                                                        previousData?.health?.maximum_capacity
                                                    }
                                                    diffViewEnabled={diffViewEnabled}
                                                    className={styles.diffContainer}
                                                >
                                                    <NumberInput
                                                        required
                                                        inputSectionClassName={styles.inputSection}
                                                        label={strings.maximumCapacity}
                                                        name="maximum_capacity"
                                                        value={value.health?.maximum_capacity}
                                                        onChange={onHealthFieldChange}
                                                        readOnly={readOnly}
                                                        error={getErrorString(
                                                            healthFormError?.maximum_capacity,
                                                        )}
                                                    />
                                                </DiffWrapper>
                                            )}
                                            <DiffWrapper
                                                showPreviousValue={showValueChanges}
                                                value={value.health?.is_isolation_rooms_wards}
                                                previousValue={
                                                    previousData?.health?.is_isolation_rooms_wards
                                                }
                                                diffViewEnabled={diffViewEnabled}
                                                className={styles.diffContainer}
                                            >
                                                <BooleanInput
                                                    className={styles.inputSection}
                                                    required
                                                    label={strings.isolationRoomsWards}
                                                    name="is_isolation_rooms_wards"
                                                    value={value.health?.is_isolation_rooms_wards}
                                                    onChange={onHealthFieldChange}
                                                    readOnly={readOnly}
                                                    error={healthFormError
                                                        ?.is_isolation_rooms_wards}
                                                />
                                            </DiffWrapper>
                                            {value.health?.is_isolation_rooms_wards && (
                                                <DiffWrapper
                                                    showPreviousValue={showValueChanges}
                                                    value={value.health?.number_of_isolation_rooms}
                                                    previousValue={
                                                        previousData
                                                            ?.health?.number_of_isolation_rooms
                                                    }
                                                    diffViewEnabled={diffViewEnabled}
                                                    className={styles.diffContainer}
                                                >
                                                    <NumberInput
                                                        required
                                                        inputSectionClassName={styles.inputSection}
                                                        label={strings.numberOfIsolationRooms}
                                                        name="number_of_isolation_rooms"
                                                        value={value.health
                                                            ?.number_of_isolation_rooms}
                                                        onChange={onHealthFieldChange}
                                                        readOnly={readOnly}
                                                        error={getErrorString(
                                                            healthFormError
                                                                ?.number_of_isolation_rooms,
                                                        )}
                                                    />
                                                </DiffWrapper>
                                            )}
                                        </>
                                    )}
                                </FormColumnContainer>
                            </FormGrid>
                        </Container>
                    </Container>
                    <Container
                        heading={strings.humanResourcesTitle}
                        withHeaderBorder
                        contentViewType="vertical"
                    >
                        <FormGrid>
                            <FormColumnContainer>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.total_number_of_human_resource}
                                    previousValue={
                                        previousData?.health?.total_number_of_human_resource
                                    }
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        required
                                        label={strings.totalNumberOfHumanResources}
                                        name="total_number_of_human_resource"
                                        value={value.health?.total_number_of_human_resource}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.total_number_of_human_resource,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.general_practitioner}
                                    previousValue={
                                        previousData?.health?.general_practitioner
                                    }
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.generalPractitioner}
                                        name="general_practitioner"
                                        value={value.health?.general_practitioner}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.general_practitioner,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.specialist}
                                    previousValue={previousData?.health?.specialist}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.specialist}
                                        name="specialist"
                                        value={value.health?.specialist}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.specialist,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.residents_doctor}
                                    previousValue={
                                        previousData?.health?.residents_doctor
                                    }
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.residentsDoctor}
                                        name="residents_doctor"
                                        value={value.health?.residents_doctor}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.residents_doctor,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.nurse}
                                    previousValue={previousData?.health?.nurse}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.nurse}
                                        name="nurse"
                                        value={value.health?.nurse}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.nurse,
                                        )}
                                    />
                                </DiffWrapper>
                            </FormColumnContainer>
                            <FormColumnContainer>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.dentist}
                                    previousValue={previousData?.health?.dentist}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.dentist}
                                        name="dentist"
                                        value={value.health?.dentist}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.dentist,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.nursing_aid}
                                    previousValue={previousData?.health?.nursing_aid}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.nursingAid}
                                        name="nursing_aid"
                                        value={value.health?.nursing_aid}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.nursing_aid,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.midwife}
                                    previousValue={previousData?.health?.midwife}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.midwife}
                                        name="midwife"
                                        value={value.health?.midwife}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.midwife,
                                        )}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    showPreviousValue={showValueChanges}
                                    value={value.health?.pharmacists}
                                    previousValue={previousData?.health?.pharmacists}
                                    diffViewEnabled={diffViewEnabled}
                                    className={styles.diffContainer}
                                >
                                    <NumberInput
                                        inputSectionClassName={styles.inputSection}
                                        label={strings.pharmacists}
                                        name="pharmacists"
                                        value={value.health?.pharmacists}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.pharmacists,
                                        )}
                                    />
                                </DiffWrapper>
                                {value.health?.other_profiles?.map((profile, i) => (
                                    <OtherProfilesInput
                                        key={profile.client_id}
                                        index={i}
                                        value={profile}
                                        onChange={onOtherProfilesChanges}
                                        onRemove={onOtherProfilesRemove}
                                        error={getErrorObject(healthFormError?.other_profiles)}
                                        readOnly={readOnly}
                                        showChanges={diffViewEnabled}
                                        previousValue={getPreviousProfileValue(profile.client_id)}
                                        showValueChanges={showValueChanges}
                                    />
                                ))}
                                {!readOnly && (
                                    <Button
                                        name={undefined}
                                        variant="secondary"
                                        disabled={readOnly}
                                        onClick={handleOtherProfilesAddButtonClick}
                                    >
                                        {strings.addOtherProfilesButtonLabel}
                                    </Button>
                                )}
                            </FormColumnContainer>
                        </FormGrid>
                    </Container>
                    <Container>
                        <DiffWrapper
                            showPreviousValue={showValueChanges}
                            value={value.health?.feedback}
                            previousValue={previousData?.health?.feedback}
                            diffViewEnabled={diffViewEnabled}
                            className={styles.diffContainer}
                        >
                            <TextArea
                                inputSectionClassName={styles.inputSection}
                                label={strings.commentsNS}
                                name="feedback"
                                value={value.health?.feedback}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={getErrorString(
                                    healthFormError?.feedback,
                                )}
                            />
                        </DiffWrapper>
                    </Container>
                </>
            )}
            {
                showDeleteLocalUnitModal && isDefined(localUnitId) && (
                    <LocalUnitDeleteModal
                        onClose={setShowDeleteLocalUnitModalFalse}
                        localUnitName={getFirstTruthyString(
                            value.local_branch_name,
                            value.english_branch_name,
                        )}
                        onDeleteActionSuccess={onDeleteActionSuccess}
                        localUnitId={localUnitId}
                    />
                )
            }
            {
                showChangesModal && (
                    <LocalUnitViewModal
                        onClose={setShowChangesModalFalse}
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
                )
            }
            {showValidateLocalUnitModal && isDefined(localUnitId) && (
                <LocalUnitValidateModal
                    localUnitId={localUnitId}
                    onClose={setShowValidateLocalUnitModalFalse}
                    localUnitName={getFirstTruthyString(
                        value.local_branch_name,
                        value.english_branch_name,
                    )}
                    onActionSuccess={onSuccess}
                />
            )}
        </div>
    );
}

export default LocalUnitsForm;
