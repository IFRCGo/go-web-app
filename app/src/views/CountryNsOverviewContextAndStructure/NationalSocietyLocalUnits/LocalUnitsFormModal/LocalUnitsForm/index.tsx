import {
    RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    DateOutput,
    Modal,
    MultiSelectInput,
    NumberInput,
    Portal,
    RawList,
    SelectInput,
    TextArea,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToComponent,
    stringKeySelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    isObject,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    removeNull,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';

import BaseMapPointInput from '#components/domain/BaseMapPointInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import NonFieldError from '#components/NonFieldError';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import {
    doArraysContainSameElements,
    flattenObject,
    getFirstTruthyString,
    getLastSegment,
} from '#utils/common';
import { VISIBILITY_PUBLIC } from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import schema, {
    type LocalUnitsRequestPostBody,
    LocalUnitsRevertRequestPostBody,
    type PartialLocalUnits,
    PartialLocalUnitsRevertForm,
    revertSchema,
    TYPE_HEALTH_CARE,
} from './schema';
import useLocalUnitFormFieldLabels from './useLocalUnitFormFieldLabels';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HealthLocalUnitFormFields = PartialLocalUnits['health'];
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]
type LocalUnitOptions = GoApiResponse<'/api/v2/local-units-options/'>;
type LocalUnitResponse = GoApiResponse<'/api/v2/local-units/{id}/'>;

interface Option {
    id: number;
    name: string;
}

type ChangedFormField = {
    key: string,
    value: string;
    valueType: 'text';
} | {
    key: string,
    value: boolean;
    valueType: 'boolean';
}

const visibilityKeySelector = (option: VisibilityOptions) => option.key;

const defaultHealthValue = {};
const defaultRevertChangesValue: PartialLocalUnitsRevertForm = {};

interface FormGridProps {
    className?: string;
    children?: React.ReactNode;
}

function FormGrid(props: FormGridProps) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(styles.formGrid, className)}>
            {children}
        </div>
    );
}

// TODO: write tests for the function and maybe consider refactoring
function getChangedFormFields(
    newValues: PartialLocalUnits,
    oldValues: LocalUnitResponse,
    formFieldOptions: LocalUnitOptions & {
        visibility: {
            id: number;
            name: string;
        }[]
    },
): ChangedFormField[] {
    const flattenedValues = flattenObject(newValues);
    const flattenedOldValues = flattenObject(oldValues);

    const changedValues: ChangedFormField[] = [];

    Object.keys(flattenedValues).forEach((key) => {
        const newValue = flattenedValues[key];
        const oldValue = flattenedOldValues[key];

        if (isNotDefined(newValue) && isNotDefined(oldValue)) {
            return;
        }
        const actualKey = getLastSegment(key, '.');
        if (Array.isArray(newValue) || Array.isArray(oldValue)) {
            if (Array.isArray(newValue) && isNotDefined(oldValue)) {
                const options: Option[] | undefined = formFieldOptions
                    ?.[actualKey as keyof LocalUnitOptions];
                const valuesLabels = newValue.map(
                    (v: number) => options.find((option: Option) => option.id === v),
                ).filter(isDefined).map((option) => option.name).join(', ');
                changedValues.push({ key, value: valuesLabels, valueType: 'text' });
            }
            if (isNotDefined(newValue)) {
                changedValues.push({ key, value: '', valueType: 'text' });
            }
            if (Array.isArray(newValue) && Array.isArray((oldValue))) {
                if (!doArraysContainSameElements(newValue, oldValue)) {
                    const options: Option[] | undefined = formFieldOptions
                        ?.[actualKey as keyof LocalUnitOptions];
                    const valuesLabels = newValue.map(
                        (v: number) => options.find((option: Option) => option.id === v),
                    ).filter(isDefined).map((option) => option.name).join(', ');
                    changedValues.push({ key, value: valuesLabels, valueType: 'text' });
                }
            }
        } else if (newValue !== oldValue) {
            const options: Option[] | undefined = formFieldOptions
                ?.[actualKey as keyof LocalUnitOptions];
            if (isDefined(options)) {
                const valueLabel = options.find(
                    (option: Option) => option.id === newValue,
                )?.name ?? '';
                changedValues.push({ key, value: valueLabel, valueType: 'text' });
            } else if (typeof newValue === 'boolean') {
                changedValues.push({ key, value: newValue, valueType: 'boolean' });
            } else {
                changedValues.push({ key, value: newValue as string, valueType: 'text' });
            }
        }
    });

    return changedValues;
}

function getLatestChangesFormFields(
    newValues: LocalUnitResponse,
    oldValues: LocalUnitResponse,
) {
    const flattenedOldValues = flattenObject(oldValues);
    const flattenedNewValues = flattenObject(newValues);

    const changedKeys: Record<
        keyof typeof flattenedOldValues, boolean
    > = {};

    Object.keys(flattenedNewValues).forEach((key) => {
        const newValue = flattenedNewValues[key];
        const oldValue = flattenedOldValues[key];

        if (Array.isArray(newValue) || Array.isArray(oldValue)) {
            if (Array.isArray(newValue) && isNotDefined(oldValue)) {
                changedKeys[key] = true;
            }
            if (isNotDefined(newValue) && Array.isArray((oldValue))) {
                changedKeys[key] = true;
            }
            if (Array.isArray((newValue)) && Array.isArray((oldValue))) {
                if (!doArraysContainSameElements(newValue, oldValue)) {
                    changedKeys[key] = true;
                }
            }
        } else if (newValue !== oldValue) {
            changedKeys[key] = true;
        }
    });

    return changedKeys;
}

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

type LocalUnitTextOutputProps = {
    localUnitFormKey: string;
    value: string;
    valueType: 'text';
} | {
    localUnitFormKey: string;
    value: boolean;
    valueType: 'boolean';
}

function LocalUnitTextOutput(props: LocalUnitTextOutputProps) {
    const { localUnitFormKey, value, valueType } = props;
    const name = useLocalUnitFormFieldLabels({ key: localUnitFormKey });

    if (valueType === 'boolean') {
        return (
            <TextOutput
                label={name}
                value={value}
                valueType={valueType}
                strongLabel
            />
        );
    }

    return (
        <TextOutput
            label={name}
            value={value}
            valueType={valueType}
            strongLabel
        />
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
    previousData?: LocalUnitResponse;
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
        previousData,
    } = props;

    const [showChangesModal, {
        setTrue: setShowChangesModalTrue,
        setFalse: setShowChangesModalFalse,
    }] = useBooleanState(false);

    const [showRevertChangesModal, {
        setTrue: setShowRevertChangesModalTrue,
        setFalse: setShowRevertChangesModalFalse,
    }] = useBooleanState(false);

    const alert = useAlert();
    const strings = useTranslation(i18n);
    const formFieldsContainerRef = useRef<HTMLDivElement>(null);

    const [
        showDeleteLocalUnitModal,
        {
            setTrue: setShowDeleteLocalUnitModalTrue,
            setFalse: setShowDeleteLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

    const {
        isSuperUser,
        isRegionAdmin,
        isCountryAdmin,
        isGuestUser,
    } = usePermissions();
    const { isAuthenticated } = useAuth();

    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();

    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const hasValidatePermission = isSuperUser
        || isCountryAdmin(Number(countryId))
        || isRegionAdmin(Number(countryResponse?.region));

    const hasDeletePermission = isAuthenticated && !isGuestUser;

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
        pristine,
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
        value: revertChangesValue,
        error: revertChangesError,
        setFieldValue: setRevertChangesFieldValue,
        validate: revertChangesValidate,
        setError: setRevertChangesError,
    } = useForm(
        revertSchema,
        { value: defaultRevertChangesValue },
    );

    const [
        localUnitChangedFormFields,
        setLocalUnitChangedFormFields,
    ] = useState<ChangedFormField[]>();

    const onHealthFieldChange = useFormObject<'health', HealthLocalUnitFormFields>(
        'health',
        setFieldValue,
        defaultHealthValue,
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
            const {
                type,
                visibility,
                country,
                subtype,
                local_branch_name,
                english_branch_name,
                level,
                focal_person_en,
                focal_person_loc,
                date_of_data,
                source_loc,
                source_en,
                address_en,
                address_loc,
                postcode,
                phone,
                email,
                city_en,
                city_loc,
                link,
                health,
                location_json,
            } = removeNull(response);

            setValue({
                type,
                visibility,
                country,
                subtype,
                local_branch_name,
                english_branch_name,
                level,
                focal_person_en,
                focal_person_loc,
                date_of_data,
                source_loc,
                source_en,
                address_en,
                address_loc,
                postcode,
                phone,
                email,
                city_en,
                city_loc,
                link,
                location_json,
                health: {
                    affiliation: health?.affiliation,
                    functionality: health?.functionality,
                    health_facility_type: health?.health_facility_type,
                    other_facility_type: health?.other_facility_type,
                    other_affiliation: health?.other_affiliation,
                    is_teaching_hospital: health?.is_teaching_hospital,
                    is_in_patient_capacity: health?.is_in_patient_capacity,
                    is_isolation_rooms_wards: health?.is_isolation_rooms_wards,
                    focal_point_email: health?.focal_point_email,
                    focal_point_position: health?.focal_point_position,
                    focal_point_phone_number: health?.focal_point_phone_number,
                    hospital_type: health?.hospital_type,
                    specialized_medical_beyond_primary_level: health
                        ?.specialized_medical_beyond_primary_level,
                    primary_health_care_center: health?.primary_health_care_center,
                    other_services: health?.other_services,
                    blood_services: health?.blood_services,
                    professional_training_facilities: health?.professional_training_facilities,
                    general_medical_services: health?.general_medical_services,
                    speciality: health?.speciality,
                    maximum_capacity: health?.maximum_capacity,
                    number_of_isolation_rooms: health?.number_of_isolation_rooms,
                    is_warehousing: health?.is_warehousing,
                    is_cold_chain: health?.is_cold_chain,
                    ambulance_type_a: health?.ambulance_type_a,
                    ambulance_type_b: health?.ambulance_type_b,
                    ambulance_type_c: health?.ambulance_type_c,
                    total_number_of_human_resource: health?.total_number_of_human_resource,
                    general_practitioner: health?.general_practitioner,
                    specialist: health?.specialist,
                    residents_doctor: health?.residents_doctor,
                    nurse: health?.nurse,
                    dentist: health?.dentist,
                    nursing_aid: health?.nursing_aid,
                    midwife: health?.midwife,
                    other_medical_heal: health?.other_medical_heal,
                    other_profiles: health?.other_profiles,
                    feedback: health?.feedback,
                },
            });
        },
    });

    const readOnly = readOnlyFromProps
        || localUnitDetailsResponse?.is_locked;

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
        onSuccess: (response) => {
            if (isNotDefined(localUnitId)) {
                setFieldValue(response.type[0].code, 'type');
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

            formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
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

            formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
        },
    });

    const handleFormSubmit = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
                return;
            }

            if (isDefined(localUnitId)) {
                updateLocalUnit(result.value as LocalUnitsRequestPostBody);
            } else {
                addLocalUnit(result.value as LocalUnitsRequestPostBody);
            }
        },
        [validate, localUnitId, setError, updateLocalUnit, addLocalUnit],
    );

    const {
        pending: revertChangesPending,
        trigger: revertChanges,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/local-units/{id}/revert/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        body: (formFields: LocalUnitsRevertRequestPostBody) => formFields,
        onSuccess: () => {
            alert.show(
                strings.revertChangesSuccessMessage,
                { variant: 'success' },
            );
            if (onSuccess) {
                onSuccess();
            }
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.revertChangesFailedMessage,
                {
                    variant: 'danger',
                },
            );
        },
    });

    const handleRevertChangesFormSubmit = useCallback(
        (formValues: PartialLocalUnitsRevertForm) => {
            revertChanges(formValues as LocalUnitsRevertRequestPostBody);
            setShowRevertChangesModalFalse();
        },
        [revertChanges, setShowRevertChangesModalFalse],
    );

    const latestChangesFormFields = useMemo(() => {
        if (isDefined(localUnitDetailsResponse) && isDefined(previousData)) {
            return getLatestChangesFormFields(
                localUnitDetailsResponse,
                previousData,
            );
        }
        return undefined;
    }, [localUnitDetailsResponse, previousData]);

    const baseMapFormFieldsChanges = useMemo(() => ({
        lat: latestChangesFormFields?.['location_json.lat'],
        lng: latestChangesFormFields?.['location_json.lng'],
    }), [latestChangesFormFields]);

    const onDoneButtonClick = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
                return;
            }
            if (isDefined(localUnitDetailsResponse)
                && isDefined(localUnitsOptions)
                && isDefined(visibilityOptions)
            ) {
                const changedFormFields = getChangedFormFields(
                    value,
                    localUnitDetailsResponse,
                    {
                        ...localUnitsOptions,
                        visibility: visibilityOptions.map((option) => ({
                            id: Number(option.key),
                            name: option.value,
                        })),
                    },
                );
                setLocalUnitChangedFormFields(changedFormFields);
            }
            setShowChangesModalTrue();
        },
        [
            setError,
            validate,
            setShowChangesModalTrue,
            localUnitDetailsResponse,
            value,
            localUnitsOptions,
            visibilityOptions,
        ],
    );

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);
    const revertChangesFormError = getErrorObject(revertChangesError);

    const submitButton = readOnly ? null : (
        <Button
            name={undefined}
            onClick={handleFormSubmit}
            disabled={addLocalUnitsPending
                || updateLocalUnitsPending}
        >
            {strings.submitButtonLabel}
        </Button>
    );

    const localUnitFormFieldRendererParams = useCallback((
        _: string,
        item: ChangedFormField,
    ) => {
        if (item.valueType === 'boolean') {
            return {
                localUnitFormKey: item.key,
                value: item.value,
                valueType: item.valueType,
            };
        }
        return {
            localUnitFormKey: item.key,
            value: item.value,
            valueType: item.valueType,
        };
    }, []);

    const isNewLocalUnit = useMemo(() => {
        if (isObject(previousData)) {
            if (Object.keys(previousData).length <= 0) {
                return true;
            }
        }
        return false;
    }, [previousData]);

    return (
        <div className={styles.localUnitsForm}>
            {isDefined(localUnitDetailsResponse)
                && readOnlyFromProps
                && !localUnitDetailsResponse.is_locked
                && isDefined(actionsContainerRef.current) && (
                <Portal container={actionsContainerRef.current}>
                    {(environment !== 'production') && (
                        <Button
                            name={undefined}
                            onClick={onEditButtonClick}
                        >
                            {strings.editButtonLabel}
                        </Button>
                    )}

                </Portal>
            )}
            {!readOnly && isDefined(localUnitId) && isDefined(actionsContainerRef.current) && (
                <Portal container={actionsContainerRef.current}>
                    <Button
                        name={undefined}
                        onClick={onDoneButtonClick}
                    >
                        {strings.doneButtonLabel}
                    </Button>
                </Portal>
            )}
            {!readOnly && isNotDefined(localUnitId) && isDefined(actionsContainerRef.current) && (
                <Portal container={actionsContainerRef.current}>
                    {submitButton}
                </Portal>
            )}
            {isDefined(headingDescriptionRef) && isDefined(headingDescriptionRef.current) && (
                <Portal container={headingDescriptionRef.current}>
                    <div className={styles.lastUpdateLabel}>
                        {isNewLocalUnit && (
                            <TextOutput
                                className={styles.newLocalUnit}
                                value={strings.newLocalUnitDescription}
                                strongValue
                            />
                        )}
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
                </Portal>
            )}
            {isDefined(headerDescriptionRef.current) && (
                <Portal container={headerDescriptionRef.current}>
                    <FormGrid>
                        <SelectInput
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.type && styles.changes,
                            )}
                            label={strings.type}
                            required
                            name="type"
                            options={localUnitsOptions?.type}
                            value={value.type}
                            onChange={setFieldValue}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            readOnly={readOnly}
                            error={error?.type}
                            nonClearable
                        />
                        <FormGrid>
                            <SelectInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.visibility && styles.changes,
                                )}
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
                            {isDefined(countryId)
                                && isDefined(localUnitId)
                                && isDefined(onSuccess)
                                && isDefined(localUnitDetailsResponse)
                                && (environment !== 'production')
                                && (
                                    <div className={styles.actions}>
                                        {hasDeletePermission && (
                                            <Button
                                                name={undefined}
                                                onClick={setShowDeleteLocalUnitModalTrue}
                                            >
                                                {strings.localUnitDeleteButtonLabel}
                                            </Button>
                                        )}
                                        {hasValidatePermission && (
                                            <LocalUnitValidateButton
                                                countryId={Number(countryId)}
                                                localUnitId={localUnitId}
                                                localUnitName={getFirstTruthyString(
                                                    value.local_branch_name,
                                                    value.english_branch_name,
                                                )}
                                                onActionSuccess={onSuccess}
                                                isValidated={localUnitDetailsResponse.validated}
                                                disabled={!pristine}
                                                readOnly={!pristine}
                                            />
                                        )}
                                        {localUnitDetailsResponse.is_locked
                                            && !isNewLocalUnit && (
                                            <Button
                                                name={undefined}
                                                onClick={setShowRevertChangesModalTrue}
                                                variant="secondary"
                                            >
                                                {strings.revertButtonLabel}
                                            </Button>
                                        )}
                                    </div>
                                )}
                        </FormGrid>
                    </FormGrid>
                </Portal>
            )}
            <Container
                containerRef={formFieldsContainerRef}
                footerActionsContainerClassName={styles.footerActions}
                footerActions={!readOnly && isNotDefined(actionsContainerRef) && submitButton}
                contentViewType="vertical"
                spacing="loose"
                pending={localUnitDetailsPending || localUnitsOptionsPending}
                errored={isDefined(localUnitId) && isDefined(localUnitDetailsError)}
                errorMessage={localUnitDetailsError?.value.messageForNotification}
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                {/* NOTE: this should be moved to health specific section */}
                <NonFieldError
                    error={error?.health}
                />
                <FormGrid>
                    <FormColumnContainer>
                        <DateInput
                            required
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.date_of_data && styles.changes,
                            )}
                            name="date_of_data"
                            label={strings.dateOfUpdate}
                            value={value.date_of_data}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.date_of_data}
                        />
                        <TextInput
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.subtype && styles.changes,
                            )}
                            label={strings.subtype}
                            placeholder={strings.subtypeDescription}
                            name="subtype"
                            value={value.subtype}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.subtype}
                        />
                        <TextInput
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.english_branch_name && styles.changes,
                            )}
                            label={strings.localUnitNameEn}
                            name="english_branch_name"
                            value={value.english_branch_name}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.english_branch_name}
                        />
                        <TextInput
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.local_branch_name && styles.changes,
                            )}
                            name="local_branch_name"
                            required
                            label={strings.localUnitNameLocal}
                            value={value.local_branch_name}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.local_branch_name}
                        />
                        {value.type !== TYPE_HEALTH_CARE && (
                            <SelectInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.level && styles.changes,
                                )}
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
                        )}
                        {value.type !== TYPE_HEALTH_CARE && (
                            <>
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.focal_person_en && styles.changes,
                                    )}
                                    name="focal_person_en"
                                    label={strings.focalPersonEn}
                                    value={value.focal_person_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.focal_person_en}
                                />
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.focal_person_loc && styles.changes,
                                    )}
                                    required
                                    label={strings.focalPersonLocal}
                                    name="focal_person_loc"
                                    value={value.focal_person_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.focal_person_loc}
                                />
                            </>
                        )}
                        {value.type !== TYPE_HEALTH_CARE && (
                            <>
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.source_en && styles.changes,
                                    )}
                                    name="source_en"
                                    label={strings.sourceEn}
                                    value={value.source_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.source_en}
                                />
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.source_loc && styles.changes,
                                    )}
                                    name="source_loc"
                                    label={strings.sourceLocal}
                                    value={value.source_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.source_loc}
                                />
                            </>
                        )}
                        {value.type === TYPE_HEALTH_CARE && (
                            <>
                                <SelectInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.['health.affiliation'] && styles.changes,
                                    )}
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
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.['health.other_affiliation']
                                        && styles.changes,
                                    )}
                                    label={strings.otherAffiliation}
                                    name="other_affiliation"
                                    value={value.health?.other_affiliation}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.other_affiliation}
                                />
                                <SelectInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.['health.functionality']
                                        && styles.changes,
                                    )}
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
                                <SelectInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields?.['health.hospital_type']
                                        && styles.changes,
                                    )}
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
                                <BooleanInput
                                    className={_cs(
                                        latestChangesFormFields?.['health.is_teaching_hospital']
                                        && styles.changes,
                                    )}
                                    required
                                    label={strings.teachingHospital}
                                    name="is_teaching_hospital"
                                    value={value.health?.is_teaching_hospital}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.is_teaching_hospital}
                                />
                                <BooleanInput
                                    className={_cs(
                                        latestChangesFormFields?.['health.is_in_patient_capacity']
                                        && styles.changes,
                                    )}
                                    required
                                    label={strings.inPatientCapacity}
                                    name="is_in_patient_capacity"
                                    value={value.health?.is_in_patient_capacity}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.is_in_patient_capacity}
                                />
                                <BooleanInput
                                    className={_cs(
                                        latestChangesFormFields?.['health.is_isolation_rooms_wards']
                                        && styles.changes,
                                    )}
                                    required
                                    label={strings.isolationRoomsWards}
                                    name="is_isolation_rooms_wards"
                                    value={value.health?.is_isolation_rooms_wards}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.is_isolation_rooms_wards}
                                />
                            </>
                        )}
                    </FormColumnContainer>
                    <FormColumnContainer>
                        <CountrySelectInput
                            inputSectionClassName={_cs(
                                latestChangesFormFields?.country
                                && styles.changes,
                            )}
                            required
                            label={strings.country}
                            name="country"
                            value={value.country}
                            onChange={setFieldValue}
                            readOnly
                        />
                        <NonFieldError
                            error={error?.location_json}
                        />
                        <BaseMapPointInput
                            country={Number(countryId)}
                            name="location_json"
                            mapContainerClassName={styles.pointInputMap}
                            value={value.location_json}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={getErrorObject(error?.location_json)}
                            baseMapFormFieldsChanges={baseMapFormFieldsChanges}
                            required
                        />
                    </FormColumnContainer>
                </FormGrid>
                <Container
                    heading={strings.addressAndContactTitle}
                    withHeaderBorder
                >
                    <FormGrid>
                        <Container
                            contentViewType="vertical"
                            spacing="comfortable"
                        >
                            <TextInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.address_en
                                    && styles.changes,
                                )}
                                name="address_en"
                                label={strings.addressEn}
                                value={value.address_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_en}
                            />
                            <TextInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.address_loc
                                    && styles.changes,
                                )}
                                name="address_loc"
                                label={strings.addressLocal}
                                value={value.address_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_loc}
                            />
                            <TextInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.city_cn
                                    && styles.changes,
                                )}
                                label={strings.localityEn}
                                name="city_en"
                                value={value.city_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_en}
                            />
                            <TextInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.city_loc
                                    && styles.changes,
                                )}
                                label={strings.localityLocal}
                                name="city_loc"
                                value={value.city_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_loc}
                            />
                            <TextInput
                                inputSectionClassName={_cs(
                                    latestChangesFormFields?.postcode
                                    && styles.changes,
                                )}
                                label={strings.postCode}
                                name="postcode"
                                value={value.postcode}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.postcode}
                            />
                        </Container>
                        <Container
                            contentViewType="vertical"
                            spacing="comfortable"
                        >
                            {value.type !== TYPE_HEALTH_CARE && (
                                <>
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.phone
                                            && styles.changes,
                                        )}
                                        label={strings.phone}
                                        name="phone"
                                        value={value.phone}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.phone}
                                    />
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.email
                                            && styles.changes,
                                        )}
                                        label={strings.email}
                                        name="email"
                                        value={value.email}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.email}
                                    />
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.link
                                            && styles.changes,
                                        )}
                                        label={strings.website}
                                        name="link"
                                        value={value.link}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.link}
                                    />
                                </>
                            )}
                            {value.type === TYPE_HEALTH_CARE && (
                                <>
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.focal_point_position']
                                            && styles.changes,
                                        )}
                                        label={strings.focalPointPosition}
                                        name="focal_point_position"
                                        value={value.health?.focal_point_position}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_position}
                                    />
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.focal_point_email']
                                            && styles.changes,
                                        )}
                                        label={strings.focalPointEmail}
                                        required
                                        name="focal_point_email"
                                        value={value.health?.focal_point_email}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_email}
                                    />
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.focal_point_phone_number']
                                            && styles.changes,
                                        )}
                                        label={strings.focalPointPhoneNumber}
                                        name="focal_point_phone_number"
                                        value={value.health?.focal_point_phone_number}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_phone_number}
                                    />
                                </>
                            )}
                        </Container>
                    </FormGrid>
                </Container>
                {value.type === TYPE_HEALTH_CARE && (
                    <>
                        <Container
                            heading={strings.specialitiesAndCapacityTitle}
                            withHeaderBorder
                            contentViewType="vertical"
                        >
                            <FormGrid>
                                <FormColumnContainer>
                                    <SelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.health_facility_type']
                                            && styles.changes,
                                        )}
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
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.other_facility_type']
                                            && styles.changes,
                                        )}
                                        label={strings.otherFacilityType}
                                        name="other_facility_type"
                                        value={value.health?.other_facility_type}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_facility_type}
                                    />
                                    <SelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.primary_health_care_center']
                                            && styles.changes,
                                        )}
                                        label={strings.primaryHealthCareCenter}
                                        name="primary_health_care_center"
                                        options={localUnitsOptions?.primary_health_care_center}
                                        value={value.health?.primary_health_care_center}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={healthFormError?.primary_health_care_center}
                                    />
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.speciality']
                                            && styles.changes,
                                        )}
                                        label={strings.specialties}
                                        name="speciality"
                                        value={value.health?.speciality}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.speciality}
                                    />
                                    <MultiSelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.general_medical_services']
                                            && styles.changes,
                                        )}
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
                                    <MultiSelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.specialized_medical_beyond_primary_level']
                                            && styles.changes,
                                        )}
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
                                    <TextInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.other_services']
                                            && styles.changes,
                                        )}
                                        label={strings.otherServices}
                                        name="other_services"
                                        value={value.health?.other_services}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_services}
                                    />
                                    <MultiSelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields?.['health.blood_services']
                                            && styles.changes,
                                        )}
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
                                    <MultiSelectInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.professional_training_facilities']
                                            && styles.changes,
                                        )}
                                        label={strings.professionalTrainingFacilities}
                                        name="professional_training_facilities"
                                        options={localUnitsOptions
                                            ?.professional_training_facilities}
                                        value={value.health?.professional_training_facilities}
                                        onChange={onHealthFieldChange}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.professional_training_facilities,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.number_of_isolation_rooms']
                                            && styles.changes,
                                        )}
                                        label={strings.numberOfIsolationRooms}
                                        name="number_of_isolation_rooms"
                                        value={value.health?.number_of_isolation_rooms}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.number_of_isolation_rooms,
                                        )}
                                    />
                                </FormColumnContainer>
                                <FormColumnContainer>
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.maximum_capacity']
                                            && styles.changes,
                                        )}
                                        label={strings.maximumCapacity}
                                        name="maximum_capacity"
                                        value={value.health?.maximum_capacity}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.maximum_capacity,
                                        )}
                                    />
                                    <BooleanInput
                                        className={_cs(
                                            latestChangesFormFields
                                                ?.['health.is_warehousing']
                                            && styles.changes,
                                        )}
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
                                    <BooleanInput
                                        className={_cs(
                                            latestChangesFormFields
                                                ?.['health.is_cold_chain']
                                            && styles.changes,
                                        )}
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
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.ambulance_type_a']
                                            && styles.changes,
                                        )}
                                        label={strings.ambulanceTypeA}
                                        name="ambulance_type_a"
                                        value={value.health?.ambulance_type_a}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.ambulance_type_a,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.ambulance_type_b']
                                            && styles.changes,
                                        )}
                                        label={strings.ambulanceTypeB}
                                        name="ambulance_type_b"
                                        value={value.health?.ambulance_type_b}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.ambulance_type_b,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.ambulance_type_c']
                                            && styles.changes,
                                        )}
                                        label={strings.ambulanceTypeC}
                                        name="ambulance_type_c"
                                        value={value.health?.ambulance_type_c}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.ambulance_type_c,
                                        )}
                                    />
                                </FormColumnContainer>
                            </FormGrid>
                        </Container>
                        <Container
                            heading={strings.humanResourcesTitle}
                            withHeaderBorder
                            contentViewType="vertical"
                        >
                            <FormGrid>
                                <FormColumnContainer>
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.total_number_of_human_resource']
                                            && styles.changes,
                                        )}
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
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.general_practitioner']
                                            && styles.changes,
                                        )}
                                        label={strings.generalPractitioner}
                                        name="general_practitioner"
                                        value={value.health?.general_practitioner}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.general_practitioner,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.specialist']
                                            && styles.changes,
                                        )}
                                        label={strings.specialist}
                                        name="specialist"
                                        value={value.health?.specialist}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.specialist,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.residents_doctor']
                                            && styles.changes,
                                        )}
                                        label={strings.residentsDoctor}
                                        name="residents_doctor"
                                        value={value.health?.residents_doctor}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.residents_doctor,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.nurse']
                                            && styles.changes,
                                        )}
                                        label={strings.nurse}
                                        name="nurse"
                                        value={value.health?.nurse}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.nurse,
                                        )}
                                    />
                                </FormColumnContainer>
                                <FormColumnContainer>
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.dentist']
                                            && styles.changes,
                                        )}
                                        label={strings.dentist}
                                        name="dentist"
                                        value={value.health?.dentist}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.dentist,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.nursing_aid']
                                            && styles.changes,
                                        )}
                                        label={strings.nursingAid}
                                        name="nursing_aid"
                                        value={value.health?.nursing_aid}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.nursing_aid,
                                        )}
                                    />
                                    <NumberInput
                                        inputSectionClassName={_cs(
                                            latestChangesFormFields
                                                ?.['health.midwife']
                                            && styles.changes,
                                        )}
                                        label={strings.midwife}
                                        name="midwife"
                                        value={value.health?.midwife}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            healthFormError?.midwife,
                                        )}
                                    />
                                </FormColumnContainer>
                            </FormGrid>
                            <FormGrid>
                                <TextInput
                                    inputSectionClassName={_cs(
                                        latestChangesFormFields
                                            ?.['health.other_profiles']
                                        && styles.changes,
                                    )}
                                    label={strings.otherProfiles}
                                    name="other_profiles"
                                    value={value.health?.other_profiles}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.other_profiles}
                                />
                                <BooleanInput
                                    className={_cs(
                                        latestChangesFormFields
                                            ?.['health.other_medical_heal']
                                        && styles.changes,
                                    )}
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
                            </FormGrid>
                        </Container>
                        <Container>
                            <TextArea
                                inputSectionClassName={_cs(
                                    latestChangesFormFields
                                        ?.['health.feedback']
                                    && styles.changes,
                                )}
                                label={strings.commentsNS}
                                name="feedback"
                                value={value.health?.feedback}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={getErrorString(
                                    healthFormError?.feedback,
                                )}
                            />
                        </Container>
                    </>
                )}
            </Container>
            {showDeleteLocalUnitModal && isDefined(localUnitId) && (
                <LocalUnitDeleteModal
                    onClose={setShowDeleteLocalUnitModalFalse}
                    localUnitName={getFirstTruthyString(
                        value.local_branch_name,
                        value.english_branch_name,
                    )}
                    onDeleteActionSuccess={onDeleteActionSuccess}
                    localUnitId={localUnitId}
                />
            )}
            {showRevertChangesModal && (
                <Modal
                    heading={strings.revertChangesModalHeading}
                    headerDescription={strings.revertChangesContentQuestion}
                    onClose={setShowRevertChangesModalFalse}
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={createSubmitHandler(
                                revertChangesValidate,
                                setRevertChangesError,
                                handleRevertChangesFormSubmit,
                            )}
                            disabled={revertChangesPending}
                        >
                            {strings.submitButtonLabel}
                        </Button>
                    )}
                >
                    <TextArea
                        name="reason"
                        required
                        label={strings.reasonLabel}
                        value={revertChangesValue.reason}
                        onChange={setRevertChangesFieldValue}
                        error={getErrorString(revertChangesFormError?.reason)}
                    />
                </Modal>
            )}
            {showChangesModal && (
                <Modal
                    heading={strings.confirmChangesModalHeading}
                    withHeaderBorder
                    onClose={setShowChangesModalFalse}
                    footerActions={submitButton}
                    headerDescription={strings.confirmChangesContentQuestion}
                >
                    <RawList
                        data={localUnitChangedFormFields}
                        renderer={LocalUnitTextOutput}
                        keySelector={stringKeySelector}
                        rendererParams={localUnitFormFieldRendererParams}
                    />
                </Modal>
            )}
        </div>
    );
}

export default LocalUnitsForm;
