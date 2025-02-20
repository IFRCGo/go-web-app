import {
    type RefObject,
    useCallback,
    useRef,
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
    SelectInput,
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
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    removeNull,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';

import DiffWrapper from '#components/DiffWrapper';
import BaseMapPointInput from '#components/domain/BaseMapPointInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import NonFieldError from '#components/NonFieldError';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import { getFirstTruthyString } from '#utils/common';
import { VISIBILITY_PUBLIC } from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import FormGrid from '../../FormGrid';
import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import LocalUnitValidateModal from '../../LocalUnitValidateModal';
import LocalUnitViewModal from '../../LocalUnitViewModal';
import schema, {
    type LocalUnitsRequestPostBody,
    type LocalUnitsRevertRequestPostBody,
    type PartialLocalUnits,
    type PartialLocalUnitsRevertForm,
    revertSchema,
    TYPE_HEALTH_CARE,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HealthLocalUnitFormFields = PartialLocalUnits['health'];
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]
type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;

const visibilityKeySelector = (option: VisibilityOptions) => option.key;

const defaultHealthValue = {};
const defaultRevertChangesValue: PartialLocalUnitsRevertForm = {};

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

    const [
        showValidateLocalUnitModal,
        {
            setTrue: setShowValidateLocalUnitModalTrue,
            setFalse: setShowValidateLocalUnitModalFalse,
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

    const hasEditPermission = hasValidatePermission;
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
            setValue(removeNull(response));
        },
    });

    const { response: localUnitPreviousResponse } = useRequest({
        url: '/api/v2/local-units/{id}/latest-change-request/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        /*
        onFailure: (error) => {
            const {
                value: {
                    messageForNotification,
                },
                debugMessage,
            } = error;
            alert.show(
                strings.localUnitsMapLatestChangesFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
        */
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

    const onDoneButtonClick = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                formFieldsContainerRef.current?.scrollIntoView({ block: 'start' });
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
    const revertChangesFormError = getErrorObject(revertChangesError);

    const submitButton = readOnly ? null : (
        <Button
            name={undefined}
            onClick={handleFormSubmit}
            disabled={addLocalUnitsPending || updateLocalUnitsPending}
        >
            {strings.submitButtonLabel}
        </Button>
    );

    const previousData = (
        localUnitPreviousResponse?.previous_data_details as unknown as LocalUnitResponse
    );
    const isNewLocalUnit = isNotDefined(previousData);
    const showChanges = !isNewLocalUnit && !!localUnitDetailsResponse?.is_locked;

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
                        <DiffWrapper
                            enabled={showChanges}
                            oldValue={previousData?.type}
                            value={value.type}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <SelectInput
                                inputSectionClassName={styles.changes}
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
                        </DiffWrapper>
                        <FormGrid>
                            <DiffWrapper
                                enabled={showChanges}
                                oldValue={previousData?.visibility}
                                value={value.visibility}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <SelectInput
                                    inputSectionClassName={styles.changes}
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
                            </DiffWrapper>
                            {isDefined(localUnitDetailsResponse)
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
                                                onClick={setShowValidateLocalUnitModalTrue}
                                                readOnly={pristine}
                                                isValidated={localUnitDetailsResponse.validated}
                                                hasValidatePermission={hasValidatePermission}
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
                        <DiffWrapper
                            value={value.date_of_data}
                            oldValue={previousData?.date_of_data}
                            enabled={showChanges}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <DateInput
                                required
                                inputSectionClassName={styles.changes}
                                name="date_of_data"
                                label={strings.dateOfUpdate}
                                value={value.date_of_data}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.date_of_data}
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            value={value.subtype}
                            oldValue={previousData?.subtype}
                            enabled={showChanges}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.changes}
                                label={strings.subtype}
                                placeholder={strings.subtypeDescription}
                                name="subtype"
                                value={value.subtype}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.subtype}
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            value={value.english_branch_name}
                            oldValue={previousData?.english_branch_name}
                            enabled={showChanges}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.changes}
                                label={strings.localUnitNameEn}
                                name="english_branch_name"
                                value={value.english_branch_name}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.english_branch_name}
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            value={value.local_branch_name}
                            oldValue={previousData?.local_branch_name}
                            enabled={showChanges}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <TextInput
                                inputSectionClassName={styles.changes}
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
                            <DiffWrapper
                                value={value.level}
                                oldValue={previousData?.level}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <SelectInput
                                    inputSectionClassName={styles.changes}
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
                            </DiffWrapper>
                        )}
                        {value.type !== TYPE_HEALTH_CARE && hasEditPermission && (
                            <>
                                <DiffWrapper
                                    value={value.focal_person_en}
                                    oldValue={previousData?.focal_person_en}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
                                        name="focal_person_en"
                                        label={strings.focalPersonEn}
                                        value={value.focal_person_en}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.focal_person_en}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.focal_person_loc}
                                    oldValue={previousData?.focal_person_loc}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
                                        required
                                        label={strings.focalPersonLocal}
                                        name="focal_person_loc"
                                        value={value.focal_person_loc}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.focal_person_loc}
                                    />
                                </DiffWrapper>
                            </>
                        )}
                        {value.type !== TYPE_HEALTH_CARE && (
                            <>
                                <DiffWrapper
                                    value={value.source_en}
                                    oldValue={previousData?.source_en}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
                                        name="source_en"
                                        label={strings.sourceEn}
                                        value={value.source_en}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.source_en}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.source_loc}
                                    oldValue={previousData?.source_loc}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
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
                                <DiffWrapper
                                    value={value.health?.affiliation}
                                    oldValue={previousData?.health?.affiliation}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.changes}
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
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.other_affiliation}
                                    oldValue={previousData?.health?.other_affiliation}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
                                        label={strings.otherAffiliation}
                                        name="other_affiliation"
                                        value={value.health?.other_affiliation}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_affiliation}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.functionality}
                                    oldValue={previousData?.health?.functionality}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.changes}
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
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.hospital_type}
                                    oldValue={previousData?.health?.hospital_type}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <SelectInput
                                        inputSectionClassName={styles.changes}
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
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.is_teaching_hospital}
                                    oldValue={
                                        previousData?.health?.is_teaching_hospital
                                    }
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <BooleanInput
                                        className={styles.changes}
                                        required
                                        label={strings.teachingHospital}
                                        name="is_teaching_hospital"
                                        value={value.health?.is_teaching_hospital}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.is_teaching_hospital}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.is_in_patient_capacity}
                                    oldValue={
                                        previousData?.health?.is_in_patient_capacity
                                    }
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <BooleanInput
                                        className={styles.changes}
                                        required
                                        label={strings.inPatientCapacity}
                                        name="is_in_patient_capacity"
                                        value={value.health?.is_in_patient_capacity}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.is_in_patient_capacity}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.is_isolation_rooms_wards}
                                    oldValue={
                                        previousData?.health?.is_isolation_rooms_wards
                                    }
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <BooleanInput
                                        className={styles.changes}
                                        required
                                        label={strings.isolationRoomsWards}
                                        name="is_isolation_rooms_wards"
                                        value={value.health?.is_isolation_rooms_wards}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.is_isolation_rooms_wards}
                                    />
                                </DiffWrapper>
                            </>
                        )}
                    </FormColumnContainer>
                    <FormColumnContainer>
                        <DiffWrapper
                            value={value.country}
                            oldValue={previousData?.country}
                            enabled={showChanges}
                            diffContainerClassName={styles.diffContainer}
                        >
                            <CountrySelectInput
                                inputSectionClassName={styles.changes}
                                required
                                label={strings.country}
                                name="country"
                                value={value.country}
                                onChange={setFieldValue}
                                readOnly
                            />
                        </DiffWrapper>
                        <NonFieldError
                            error={error?.location_json}
                        />
                        <DiffWrapper
                            diffContainerClassName={styles.latitudeDiffWrapper}
                            value={value.location_json?.lat}
                            oldValue={previousData?.location_json?.lat}
                            enabled={showChanges}
                        >
                            <DiffWrapper
                                diffContainerClassName={styles.longitudeDiffWrapper}
                                value={value.location_json?.lng}
                                oldValue={previousData?.location_json?.lng}
                                enabled={showChanges}
                            >
                                <BaseMapPointInput
                                    latitudeInputSectionClassName={styles.latitudeChanges}
                                    longitudeInputSectionClassName={styles.longitudeChanges}
                                    country={Number(countryId)}
                                    name="location_json"
                                    mapContainerClassName={styles.pointInputMap}
                                    value={value.location_json}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={getErrorObject(error?.location_json)}
                                    showChanges={showChanges}
                                    required
                                />
                            </DiffWrapper>
                        </DiffWrapper>
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
                            <DiffWrapper
                                value={value.address_en}
                                oldValue={previousData?.address_en}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.changes}
                                    name="address_en"
                                    label={strings.addressEn}
                                    value={value.address_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_en}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                value={value.address_loc}
                                oldValue={previousData?.address_loc}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.changes}
                                    name="address_loc"
                                    label={strings.addressLocal}
                                    value={value.address_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.address_loc}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                value={value.city_en}
                                oldValue={previousData?.city_en}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.changes}
                                    label={strings.localityEn}
                                    name="city_en"
                                    value={value.city_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_en}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                value={value.city_loc}
                                oldValue={previousData?.city_loc}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.changes}
                                    label={strings.localityLocal}
                                    name="city_loc"
                                    value={value.city_loc}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.city_loc}
                                />
                            </DiffWrapper>
                            <DiffWrapper
                                value={value.postcode}
                                oldValue={previousData?.postcode}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextInput
                                    inputSectionClassName={styles.changes}
                                    label={strings.postCode}
                                    name="postcode"
                                    value={value.postcode}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.postcode}
                                />
                            </DiffWrapper>
                        </Container>
                        <Container
                            contentViewType="vertical"
                            spacing="comfortable"
                        >
                            {value.type !== TYPE_HEALTH_CARE && (
                                <>
                                    {hasEditPermission && (
                                        <>
                                            <DiffWrapper
                                                value={value.phone}
                                                oldValue={previousData?.phone}
                                                enabled={showChanges}
                                                diffContainerClassName={styles.diffContainer}
                                            >
                                                <TextInput
                                                    inputSectionClassName={styles.changes}
                                                    label={strings.phone}
                                                    name="phone"
                                                    value={value.phone}
                                                    onChange={setFieldValue}
                                                    readOnly={readOnly}
                                                    error={error?.phone}
                                                />
                                            </DiffWrapper>
                                            <DiffWrapper
                                                value={value.email}
                                                oldValue={previousData?.email}
                                                enabled={showChanges}
                                                diffContainerClassName={styles.diffContainer}
                                            >
                                                <TextInput
                                                    inputSectionClassName={styles.changes}
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
                                        value={value.link}
                                        oldValue={previousData?.link}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.changes}
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
                            {value.type === TYPE_HEALTH_CARE && (
                                <>
                                    <DiffWrapper
                                        value={value.health?.focal_point_position}
                                        oldValue={
                                            previousData?.health?.focal_point_position
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.changes}
                                            label={strings.focalPointPosition}
                                            name="focal_point_position"
                                            value={value.health?.focal_point_position}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.focal_point_position}
                                        />
                                    </DiffWrapper>
                                    {hasEditPermission && (
                                        <>
                                            <DiffWrapper
                                                value={value.health?.focal_point_email}
                                                oldValue={previousData?.health?.focal_point_email}
                                                enabled={showChanges}
                                                diffContainerClassName={styles.diffContainer}
                                            >
                                                <TextInput
                                                    inputSectionClassName={styles.changes}
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
                                                value={value.health?.focal_point_phone_number}
                                                oldValue={
                                                    previousData?.health?.focal_point_phone_number
                                                }
                                                enabled={showChanges}
                                                diffContainerClassName={styles.diffContainer}
                                            >
                                                <TextInput
                                                    inputSectionClassName={styles.changes}
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
                                    )}
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
                                    <DiffWrapper
                                        value={value.health?.health_facility_type}
                                        oldValue={previousData?.health?.health_facility_type}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <SelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.other_facility_type}
                                        oldValue={previousData?.health?.other_facility_type}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.changes}
                                            label={strings.otherFacilityType}
                                            name="other_facility_type"
                                            value={value.health?.other_facility_type}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.other_facility_type}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.primary_health_care_center}
                                        oldValue={previousData?.health?.primary_health_care_center}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <SelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.speciality}
                                        oldValue={previousData?.health?.speciality}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.changes}
                                            label={strings.specialities}
                                            name="speciality"
                                            value={value.health?.speciality}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.speciality}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.general_medical_services}
                                        oldValue={previousData?.health?.general_medical_services}
                                        enabled={showChanges}
                                    >
                                        <MultiSelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={
                                            value.health?.specialized_medical_beyond_primary_level
                                        }
                                        oldValue={
                                            previousData
                                                ?.health?.specialized_medical_beyond_primary_level
                                        }
                                        enabled={showChanges}
                                    >
                                        <MultiSelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.other_services}
                                        oldValue={previousData?.health?.other_services}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <TextInput
                                            inputSectionClassName={styles.changes}
                                            label={strings.otherServices}
                                            name="other_services"
                                            value={value.health?.other_services}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={healthFormError?.other_services}
                                        />
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.blood_services}
                                        oldValue={previousData?.health?.blood_services}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <MultiSelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.professional_training_facilities}
                                        oldValue={
                                            previousData?.health?.professional_training_facilities
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <MultiSelectInput
                                            inputSectionClassName={styles.changes}
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
                                    </DiffWrapper>
                                    <DiffWrapper
                                        value={value.health?.number_of_isolation_rooms}
                                        oldValue={
                                            previousData
                                                ?.health?.number_of_isolation_rooms
                                        }
                                        enabled={showChanges}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
                                            label={strings.numberOfIsolationRooms}
                                            name="number_of_isolation_rooms"
                                            value={value.health?.number_of_isolation_rooms}
                                            onChange={onHealthFieldChange}
                                            readOnly={readOnly}
                                            error={getErrorString(
                                                healthFormError?.number_of_isolation_rooms,
                                            )}
                                        />
                                    </DiffWrapper>
                                </FormColumnContainer>
                                <FormColumnContainer>
                                    <DiffWrapper
                                        value={value.health?.maximum_capacity}
                                        oldValue={
                                            previousData?.health?.maximum_capacity
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                    <DiffWrapper
                                        value={value.health?.is_warehousing}
                                        oldValue={previousData?.health?.is_warehousing}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <BooleanInput
                                            className={styles.changes}
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
                                        value={value.health?.is_cold_chain}
                                        oldValue={previousData?.health?.is_cold_chain}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <BooleanInput
                                            className={styles.changes}
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
                                        value={value.health?.ambulance_type_a}
                                        oldValue={
                                            previousData?.health?.ambulance_type_a
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.ambulance_type_b}
                                        oldValue={
                                            previousData?.health?.ambulance_type_b
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.ambulance_type_c}
                                        oldValue={
                                            previousData?.health?.ambulance_type_c
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                    <DiffWrapper
                                        value={value.health?.total_number_of_human_resource}
                                        oldValue={
                                            previousData?.health?.total_number_of_human_resource
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.general_practitioner}
                                        oldValue={
                                            previousData?.health?.general_practitioner
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.specialist}
                                        oldValue={previousData?.health?.specialist}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.residents_doctor}
                                        oldValue={
                                            previousData?.health?.residents_doctor
                                        }
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.nurse}
                                        oldValue={previousData?.health?.nurse}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.dentist}
                                        oldValue={previousData?.health?.dentist}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.nursing_aid}
                                        oldValue={previousData?.health?.nursing_aid}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                        value={value.health?.nursing_aid}
                                        oldValue={previousData?.health?.nursing_aid}
                                        enabled={showChanges}
                                        diffContainerClassName={styles.diffContainer}
                                    >
                                        <NumberInput
                                            inputSectionClassName={styles.changes}
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
                                </FormColumnContainer>
                            </FormGrid>
                            <FormGrid>
                                <DiffWrapper
                                    value={value.health?.other_profiles}
                                    oldValue={previousData?.health?.other_profiles}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <TextInput
                                        inputSectionClassName={styles.changes}
                                        label={strings.otherProfiles}
                                        name="other_profiles"
                                        value={value.health?.other_profiles}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_profiles}
                                    />
                                </DiffWrapper>
                                <DiffWrapper
                                    value={value.health?.other_medical_heal}
                                    oldValue={previousData?.health?.other_medical_heal}
                                    enabled={showChanges}
                                    diffContainerClassName={styles.diffContainer}
                                >
                                    <BooleanInput
                                        className={styles.changes}
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
                            </FormGrid>
                        </Container>
                        <Container>
                            <DiffWrapper
                                value={value.health?.feedback}
                                oldValue={previousData?.health?.feedback}
                                enabled={showChanges}
                                diffContainerClassName={styles.diffContainer}
                            >
                                <TextArea
                                    inputSectionClassName={styles.changes}
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
                <LocalUnitViewModal
                    onClose={setShowChangesModalFalse}
                    footerActions={submitButton}
                    localUnitId={localUnitId}
                    locallyChangedValue={value}
                />
            )}
            {showValidateLocalUnitModal
                && isDefined(localUnitId) && (
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
