import {
    RefObject,
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
    MultiSelectInput,
    NumberInput,
    Portal,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToComponent,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
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
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import { getFirstTruthyString } from '#utils/common';
import { VISIBILITY_PUBLIC } from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import LocalUnitDeleteButton from '../../LocalUnitDeleteButton';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import schema, {
    type LocalUnitsRequestPostBody,
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HealthLocalUnitFormFields = PartialLocalUnits['health'];
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]

const VisibilityOptions = (option: VisibilityOptions) => option.key;
const defaultHealthValue = {};

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
    localUnitId?: number;
    actionsContainerRef: RefObject<HTMLDivElement>;
    headingDescriptionRef?: RefObject<HTMLDivElement>;
    headerDescriptionRef: RefObject<HTMLDivElement>;
}

function LocalUnitsForm(props: Props) {
    const {
        readOnly = false,
        onSuccess,
        onEditButtonClick,
        localUnitId,
        actionsContainerRef,
        headingDescriptionRef,
        headerDescriptionRef,
    } = props;

    const alert = useAlert();
    const strings = useTranslation(i18n);
    const formFieldsContainerRef = useRef<HTMLDivElement>(null);

    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();
    const { countryId } = useOutletContext<CountryOutletContext>();
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
                location_details,
                ...other
            } = removeNull(response);

            const point = location_details.coordinates as [number, number];

            setValue({
                location_json: {
                    lng: point[0],
                    lat: point[1],
                },
                ...other,
            });
        },
    });

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

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);

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

    return (
        <div className={styles.localUnitsForm}>
            {readOnly && isDefined(actionsContainerRef.current) && (
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
            {!readOnly && isDefined(actionsContainerRef.current) && (
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
                        <SelectInput
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
                                label={strings.visibility}
                                name="visibility"
                                required
                                nonClearable
                                options={visibilityOptions}
                                value={value.visibility}
                                onChange={setFieldValue}
                                keySelector={VisibilityOptions}
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
                                        <LocalUnitDeleteButton
                                            countryId={Number(countryId)}
                                            localUnitId={localUnitId}
                                            localUnitName={getFirstTruthyString(
                                                value.local_branch_name,
                                                value.english_branch_name,
                                            )}
                                            onActionSuccess={onSuccess}
                                            disabled={!pristine}
                                        />
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
                                    </div>
                                )}
                        </FormGrid>
                    </FormGrid>
                </Portal>
            )}
            <Container
                containerRef={formFieldsContainerRef}
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
                            name="date_of_data"
                            label={strings.dateOfUpdate}
                            value={value.date_of_data}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.date_of_data}
                        />
                        <TextInput
                            label={strings.subtype}
                            placeholder={strings.subtypeDescription}
                            name="subtype"
                            value={value.subtype}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.subtype}
                        />
                        <TextInput
                            label={strings.localUnitNameEn}
                            name="english_branch_name"
                            value={value.english_branch_name}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.english_branch_name}
                        />
                        <TextInput
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
                                    name="focal_person_en"
                                    label={strings.focalPersonEn}
                                    value={value.focal_person_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.focal_person_en}
                                />
                                <TextInput
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
                                    name="source_en"
                                    label={strings.sourceEn}
                                    value={value.source_en}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.source_en}
                                />
                                <TextInput
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
                                    label={strings.otherAffiliation}
                                    name="other_affiliation"
                                    value={value.health?.other_affiliation}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.other_affiliation}
                                />
                                <SelectInput
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
                                    required
                                    label={strings.teachingHospital}
                                    name="is_teaching_hospital"
                                    value={value.health?.is_teaching_hospital}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.is_teaching_hospital}
                                />
                                <BooleanInput
                                    required
                                    label={strings.inPatientCapacity}
                                    name="is_in_patient_capacity"
                                    value={value.health?.is_in_patient_capacity}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.is_in_patient_capacity}
                                />
                                <BooleanInput
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
                                name="address_en"
                                label={strings.addressEn}
                                value={value.address_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_en}
                            />
                            <TextInput
                                name="address_loc"
                                label={strings.addressLocal}
                                value={value.address_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_loc}
                            />
                            <TextInput
                                label={strings.localityEn}
                                name="city_en"
                                value={value.city_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_en}
                            />
                            <TextInput
                                label={strings.localityLocal}
                                name="city_loc"
                                value={value.city_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_loc}
                            />
                            <TextInput
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
                                        label={strings.phone}
                                        name="phone"
                                        value={value.phone}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.phone}
                                    />
                                    <TextInput
                                        label={strings.email}
                                        name="email"
                                        value={value.email}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.email}
                                    />
                                    <TextInput
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
                                        label={strings.focalPointPosition}
                                        name="focal_point_position"
                                        value={value.health?.focal_point_position}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_position}
                                    />
                                    <TextInput
                                        label={strings.focalPointEmail}
                                        required
                                        name="focal_point_email"
                                        value={value.health?.focal_point_email}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.focal_point_email}
                                    />
                                    <TextInput
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
                                        label={strings.otherFacilityType}
                                        name="other_facility_type"
                                        value={value.health?.other_facility_type}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_facility_type}
                                    />
                                    <SelectInput
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
                                        label={strings.specialties}
                                        name="speciality"
                                        value={value.health?.speciality}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.speciality}
                                    />
                                    <MultiSelectInput
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
                                        label={strings.specializedMedicalService}
                                        required
                                        name="specialized_medical_beyond_primary_level"
                                        options={localUnitsOptions?.specialized_medical_services}
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
                                        label={strings.otherServices}
                                        name="other_services"
                                        value={value.health?.other_services}
                                        onChange={onHealthFieldChange}
                                        readOnly={readOnly}
                                        error={healthFormError?.other_services}
                                    />
                                    <MultiSelectInput
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
                                    label={strings.otherProfiles}
                                    name="other_profiles"
                                    value={value.health?.other_profiles}
                                    onChange={onHealthFieldChange}
                                    readOnly={readOnly}
                                    error={healthFormError?.other_profiles}
                                />
                                <BooleanInput
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
        </div>
    );
}

export default LocalUnitsForm;
