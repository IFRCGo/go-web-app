import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BooleanInput,
    Button,
    Container,
    InputSection,
    MultiSelectInput,
    NumberInput,
    PageContainer,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
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
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import { VISIBILITY_PUBLIC } from '#utils/constants';
import { CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import schema, {
    type LocalUnitsRequestPostBody,
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type HealthLocalUnitFormFields = PartialLocalUnits['health'];
type LocalUnitsOptionsType = GoApiResponse<'/api/v2/local-units-options/'>;
type LocalUnitType = NonNullable<LocalUnitsOptionsType['type']>[number];
type LocalUnitCoverage = NonNullable<LocalUnitsOptionsType['level']>[number];
type LocalUnitAffiliation = NonNullable<LocalUnitsOptionsType['affiliation']>[number];
type LocalUnitHealthFacility = NonNullable<LocalUnitsOptionsType['health_facility_type']>[number];
type LocalUnitBloodServices = NonNullable<LocalUnitsOptionsType['blood_services']>[number];
type LocalUnitProfessionalTraining = NonNullable<LocalUnitsOptionsType['professional_training_facilities']>[number];
type LocalUnitGeneralMedical = NonNullable<LocalUnitsOptionsType['general_medical_services']>[number];
type LocalUnitPrimaryHealthCareCenter = NonNullable<LocalUnitsOptionsType['primary_health_care_center']>[number];
type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]

const localUnitTypeCodeSelector = (localUnit: LocalUnitType) => localUnit.code;
const localUnitCoverageLevelSelector = (localUnit: LocalUnitCoverage) => localUnit.level;
const localUnitAffiliationCodeSelector = (localUnit: LocalUnitAffiliation) => localUnit.code;
const localUnitHealthFacilityCodeSelector = (localUnit: LocalUnitHealthFacility) => localUnit.code;
const LocalUnitPrimaryHealthCareCenterCodeSelector = (
    localUnit: LocalUnitPrimaryHealthCareCenter,
) => localUnit.code;
const localUnitBloodServicesCodeSelector = (localUnit: LocalUnitBloodServices) => localUnit.code;
const LocalUnitProfessionalTrainingCodeSelector = (
    localUnit: LocalUnitProfessionalTraining,
) => localUnit.code;
const localUnitGeneralMedicalCodeSelector = (localUnit: LocalUnitGeneralMedical) => localUnit.code;
const VisibilityOptions = (option: VisibilityOptions) => option.key;
const defaultHealthValue = {};

interface Props {
    readOnly?: boolean;
    onSuccess?: () => void;
    localUnitId?: number;
}

function LocalUnitsForm(props: Props) {
    const {
        readOnly = false,
        onSuccess,
        localUnitId,
    } = props;
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();
    const { countryId } = useOutletContext<CountryOutletContext>();
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
        trigger: addLocalUnits,
    } = useLazyRequest({
        url: '/api/v2/local-units/',
        method: 'POST',
        body: (formFields: LocalUnitsRequestPostBody) => formFields,
        onSuccess: () => {
            if (onSuccess) {
                onSuccess();
            }
            alert.show(
                'success',
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                'Failed',
                { variant: 'danger' },
            );
        },
    });

    const handleFormSubmit = useCallback(
        () => {
            const result = validate();
            if (result.errored) {
                setError(result.error);
                return;
            }
            addLocalUnits({
                ...result.value,
                country: Number(countryId),
            } as LocalUnitsRequestPostBody);
        },
        [validate, setError, addLocalUnits, countryId],
    );

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);

    return (
        <PageContainer
            className={styles.localUnitsForm}
        >
            <Container
                footerActions={(
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        disabled={addLocalUnitsPending}
                    >
                        {strings.submitButtonLabel}
                    </Button>
                )}
                contentViewType="vertical"
                spacing="loose"
                pending={localUnitDetailsPending || localUnitsOptionsPending}
                errored={isDefined(localUnitId) && isDefined(localUnitDetailsError)}
                errorMessage={localUnitDetailsError?.value.messageForNotification}
            >
                <InputSection
                    numPreferredColumns={3}
                    withoutTitleSection
                    withoutPadding
                >
                    <SelectInput
                        label={strings.type}
                        required
                        name="type"
                        options={localUnitsOptions?.type}
                        value={value.type}
                        onChange={setFieldValue}
                        keySelector={localUnitTypeCodeSelector}
                        labelSelector={stringNameSelector}
                        readOnly={readOnly}
                        error={error?.type}
                        nonClearable
                    />
                    <TextInput
                        label={strings.subtype}
                        hint={strings.subtypeDescription}
                        name="subtype"
                        value={value.subtype}
                        onChange={setFieldValue}
                        readOnly={readOnly}
                        error={error?.subtype}
                    />
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
                    {value.type !== TYPE_HEALTH_CARE && (
                        <SelectInput
                            label={strings.coverage}
                            name="level"
                            options={localUnitsOptions?.level}
                            value={value.level}
                            onChange={setFieldValue}
                            keySelector={localUnitCoverageLevelSelector}
                            labelSelector={stringNameSelector}
                            readOnly={readOnly}
                            error={error?.level}
                        />
                    )}
                    {value.type === TYPE_HEALTH_CARE && (
                        <SelectInput
                            label={strings.affiliation}
                            required
                            name="affiliation"
                            options={localUnitsOptions?.affiliation}
                            value={value.health?.affiliation}
                            onChange={onHealthFieldChange}
                            keySelector={localUnitAffiliationCodeSelector}
                            labelSelector={stringNameSelector}
                            readOnly={readOnly}
                            error={healthFormError?.affiliation}
                        />
                    )}
                    {value.type === TYPE_HEALTH_CARE && (
                        <TextInput
                            label={strings.otherAffiliation}
                            name="other_affiliation"
                            value={value.health?.other_affiliation}
                            onChange={onHealthFieldChange}
                            readOnly={readOnly}
                            error={healthFormError?.other_affiliation}
                        />
                    )}
                    {value.type === TYPE_HEALTH_CARE && (
                        <SelectInput
                            required
                            label={strings.functionality}
                            name="functionality"
                            options={localUnitsOptions?.functionality}
                            value={value.health?.functionality}
                            onChange={onHealthFieldChange}
                            keySelector={localUnitAffiliationCodeSelector}
                            labelSelector={stringNameSelector}
                            readOnly={readOnly}
                            error={healthFormError?.functionality}
                        />
                    )}
                </InputSection>
                <InputSection
                    title={strings.localUnitName}
                    numPreferredColumns={2}
                    withoutPadding
                >
                    <TextInput
                        name="local_branch_name"
                        required
                        label={strings.localLabel}
                        value={value.local_branch_name}
                        onChange={setFieldValue}
                        readOnly={readOnly}
                        error={error?.local_branch_name}
                    />
                    <TextInput
                        label={strings.englishLabel}
                        name="english_branch_name"
                        value={value.english_branch_name}
                        onChange={setFieldValue}
                        readOnly={readOnly}
                        error={error?.english_branch_name}
                    />
                </InputSection>
                {value.type !== TYPE_HEALTH_CARE && (
                    <InputSection
                        title={strings.source}
                        numPreferredColumns={2}
                        withoutPadding
                    >
                        <TextInput
                            name="source_loc"
                            label={strings.localLabel}
                            value={value.source_en}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.source_en}
                        />
                        <TextInput
                            name="source_en"
                            label={strings.englishLabel}
                            value={value.source_en}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                            error={error?.source_en}
                        />
                    </InputSection>
                )}
                <Container
                    heading={strings.addressAndContactTitle}
                    withHeaderBorder
                    contentViewType="grid"
                    numPreferredGridContentColumns={2}
                    headingLevel={2}
                    spacing="comfortable"
                >
                    <Container contentViewType="vertical">
                        <InputSection
                            title={strings.address}
                            numPreferredColumns={3}
                            withoutPadding
                        >
                            <TextInput
                                name="address_en"
                                label={strings.englishLabel}
                                value={value.address_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_en}
                            />
                            <TextInput
                                name="address_loc"
                                label={strings.localLabel}
                                value={value.address_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.address_loc}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.locality}
                            numPreferredColumns={3}
                            withoutPadding
                        >
                            <TextInput
                                label={strings.englishLabel}
                                name="city_en"
                                value={value.city_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_en}
                            />
                            <TextInput
                                label={strings.localLabel}
                                name="city_loc"
                                value={value.city_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.city_loc}
                            />
                        </InputSection>
                        <InputSection
                            numPreferredColumns={3}
                            withoutPadding
                            // FIXME: use strings
                            title="Local Unit detail"
                        >
                            <TextInput
                                label={strings.postCode}
                                name="postcode"
                                value={value.postcode}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.postcode}
                            />
                            {value.type !== TYPE_HEALTH_CARE && (
                                <TextInput
                                    label={strings.phone}
                                    name="phone"
                                    value={value.phone}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.phone}
                                />
                            )}
                            {value.type !== TYPE_HEALTH_CARE && (
                                <TextInput
                                    label={strings.email}
                                    name="email"
                                    value={value.email}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.email}
                                />
                            )}
                            {value.type !== TYPE_HEALTH_CARE && (
                                <TextInput
                                    label={strings.website}
                                    name="link"
                                    value={value.link}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.link}
                                />
                            )}
                        </InputSection>
                        <InputSection
                            title={strings.focalPerson}
                            numPreferredColumns={2}
                            withoutPadding
                        >
                            <TextInput
                                required
                                label={strings.localLabel}
                                name="focal_person_loc"
                                value={value.focal_person_loc}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.focal_person_loc}
                            />
                            <TextInput
                                name="focal_person_en"
                                label={strings.englishLabel}
                                value={value.focal_person_en}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.focal_person_en}
                            />
                        </InputSection>
                        {value.type === TYPE_HEALTH_CARE && (
                            <InputSection
                                title={strings.focalPointLabel}
                                numPreferredColumns={2}
                                withoutPadding
                            >
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
                            </InputSection>
                        )}
                    </Container>
                    <Container
                        contentViewType="vertical"
                    >
                        <InputSection
                            withoutPadding
                            withoutTitleSection
                            numPreferredColumns={3}
                        >
                            <CountrySelectInput
                                // FIXME: use strings
                                label="Country"
                                name="country"
                                value={value.country}
                                onChange={setFieldValue}
                                readOnly
                            />
                        </InputSection>
                        <BaseMapPointInput
                            country={Number(countryId)}
                            name="location_json"
                            mapContainerClassName={styles.pointInputMap}
                            value={value.location_json}
                            onChange={setFieldValue}
                            readOnly={readOnly}
                        />
                    </Container>
                </Container>
                {value.type === TYPE_HEALTH_CARE && (
                    <Container
                        heading="Health care details"
                        headingLevel={2}
                        withHeaderBorder
                        contentViewType="vertical"
                        spacing="comfortable"
                        childrenContainerClassName={styles.healthCareDetailsContent}
                    >
                        <InputSection
                            title={strings.facilityCategoryTitle}
                            withoutPadding
                            numPreferredColumns={2}
                        >
                            <SelectInput
                                label={strings.healthFacilityType}
                                required
                                name="health_facility_type"
                                options={localUnitsOptions?.health_facility_type}
                                value={value.health?.health_facility_type}
                                onChange={onHealthFieldChange}
                                keySelector={localUnitHealthFacilityCodeSelector}
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
                                label={strings.healthFacilityType}
                                name="primary_health_care_center"
                                options={localUnitsOptions?.primary_health_care_center}
                                value={value.health?.primary_health_care_center}
                                onChange={onHealthFieldChange}
                                keySelector={LocalUnitPrimaryHealthCareCenterCodeSelector}
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
                            <SelectInput
                                label={strings.hospitalType}
                                required
                                name="hospital_type"
                                options={localUnitsOptions?.hospital_type}
                                value={value.health?.hospital_type}
                                onChange={onHealthFieldChange}
                                keySelector={LocalUnitPrimaryHealthCareCenterCodeSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={healthFormError?.hospital_type}
                            />
                            <BooleanInput
                                label={strings.teachingHospital}
                                name="is_teaching_hospital"
                                value={value.health?.is_teaching_hospital}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={healthFormError?.is_teaching_hospital}
                            />
                            <BooleanInput
                                label={strings.inPatientCapacity}
                                name="is_in_patient_capacity"
                                value={value.health?.is_in_patient_capacity}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={healthFormError?.is_in_patient_capacity}
                            />
                            <BooleanInput
                                label={strings.isolationRoomsWards}
                                name="is_isolation_rooms_wards"
                                value={value.health?.is_isolation_rooms_wards}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={healthFormError?.is_isolation_rooms_wards}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.facilityCapacityTitle}
                            numPreferredColumns={2}
                            withoutPadding
                        >
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
                            <BooleanInput
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
                        </InputSection>
                        <InputSection
                            title={strings.servicesTitle}
                            withoutPadding
                            numPreferredColumns={2}
                        >
                            <MultiSelectInput
                                label={strings.generalMedicalServices}
                                name="general_medical_services"
                                options={localUnitsOptions?.general_medical_services}
                                value={value.health?.general_medical_services}
                                onChange={onHealthFieldChange}
                                keySelector={localUnitGeneralMedicalCodeSelector}
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
                                value={value.health?.specialized_medical_beyond_primary_level}
                                onChange={onHealthFieldChange}
                                keySelector={LocalUnitProfessionalTrainingCodeSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(
                                    healthFormError?.specialized_medical_beyond_primary_level,
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
                                keySelector={localUnitBloodServicesCodeSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(healthFormError?.blood_services)}
                            />
                            <MultiSelectInput
                                label={strings.professionalTrainingFacilities}
                                name="professional_training_facilities"
                                options={localUnitsOptions?.professional_training_facilities}
                                value={value.health?.professional_training_facilities}
                                onChange={onHealthFieldChange}
                                keySelector={LocalUnitProfessionalTrainingCodeSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(
                                    healthFormError?.professional_training_facilities,
                                )}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.humanResourcesTitle}
                            numPreferredColumns={2}
                            withoutPadding
                        >
                            <NumberInput
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
                            <BooleanInput
                                label={strings.otherMedicalHeal}
                                name="other_medical_heal"
                                value={value.health?.other_medical_heal}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={getErrorString(
                                    healthFormError?.other_medical_heal,
                                )}
                            />
                            <TextInput
                                label={strings.otherProfiles}
                                name="other_profiles"
                                value={value.health?.other_profiles}
                                onChange={onHealthFieldChange}
                                readOnly={readOnly}
                                error={healthFormError?.other_profiles}
                            />
                        </InputSection>
                    </Container>
                )}
                <Container
                    heading={strings.commentsNS}
                    headingLevel={2}
                    withHeaderBorder
                    spacing="comfortable"
                >
                    <TextArea
                        name="feedback"
                        value={value.health?.feedback}
                        onChange={onHealthFieldChange}
                        readOnly={readOnly}
                        error={getErrorString(
                            healthFormError?.feedback,
                        )}
                    />
                </Container>
            </Container>
        </PageContainer>
    );
}

export default LocalUnitsForm;
