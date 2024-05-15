import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BooleanInput,
    Button,
    Container,
    InputSection,
    MultiSelectInput,
    NumberInput,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    getErrorObject,
    getErrorString,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';
import { MapboxGeoJSONFeature } from 'mapbox-gl';

import BaseMapPointInput from '#components/domain/BaseMapPointInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import { CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
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

interface Props {
    viewMode?: boolean;
    localUnitsOptions?: LocalUnitsOptionsType;
    onLocalUnitTypeClick: (type?: string) => void;
}

const defaultHealthValue = {};

function AddEditLocalUnitsForm(props: Props) {
    const {
        viewMode = false,
        localUnitsOptions,
        onLocalUnitTypeClick,
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
    } = useForm(
        schema,
        {
            value: {},
        },
    );

    const onHealthFieldChange = useFormObject<'health', HealthLocalUnitFormFields>(
        'health',
        setFieldValue,
        defaultHealthValue,
    );

    const {
        pending: addLocalUnitsPending,
        trigger: addLocalUnits,
    } = useLazyRequest({
        url: '/api/v2/local-units/',
        method: 'POST',
        body: (formFields: LocalUnitsRequestPostBody) => formFields,
        onSuccess: () => {
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
                location: 'POINT (9.508129 51.328126)',
            } as LocalUnitsRequestPostBody);
        },
        [validate, setError, addLocalUnits, countryId],
    );

    const handleLocalUnitType = useCallback(
        (type?: number) => {
            setFieldValue(type, 'type');
            if (isNotDefined(localUnitsOptions)) {
                return;
            }
            const selectedType = localUnitsOptions.type.find(
                (opt) => opt.code === type,
            );

            onLocalUnitTypeClick(selectedType?.name);
        },
        [setFieldValue, localUnitsOptions, onLocalUnitTypeClick],
    );

    const handleMapPointClick = useCallback(
        (feature: MapboxGeoJSONFeature) => {
            const country = feature.properties?.country_id as number | undefined;
            setFieldValue(country, 'country');
        },
        [setFieldValue],
    );

    const error = getErrorObject(formError);
    const healthFormError = getErrorObject(error?.health);

    return (
        <div className={styles.localUnitsForm}>
            <InputSection
                title={strings.localUnitsFormType}
                withAsteriskOnTitle
            >
                <SelectInput
                    name="type"
                    options={localUnitsOptions?.type}
                    value={value.type}
                    onChange={handleLocalUnitType}
                    keySelector={localUnitTypeCodeSelector}
                    labelSelector={stringNameSelector}
                    readOnly={viewMode}
                    error={error?.type}
                />
            </InputSection>
            <InputSection
                title={strings.localUnitsFormSubtype}
                description={strings.localUnitsFormSubtypeDescription}
            >
                <TextInput
                    name="subtype"
                    value={value.subtype}
                    onChange={setFieldValue}
                    readOnly={viewMode}
                    error={error?.subtype}
                />
            </InputSection>
            <InputSection
                title={strings.localUnitsVisibility}
                withAsteriskOnTitle
            >
                <SelectInput
                    name="visibility"
                    options={visibilityOptions}
                    value={value.visibility}
                    onChange={setFieldValue}
                    keySelector={VisibilityOptions}
                    labelSelector={stringValueSelector}
                    readOnly={viewMode}
                    error={error?.type}
                />
            </InputSection>
            <InputSection
                title={strings.localUnitsFormLocalUnitName}
                description={strings.localUnitsFormLocalDescription}
                withAsteriskOnTitle
            >
                <TextInput
                    name="local_branch_name"
                    value={value.local_branch_name}
                    onChange={setFieldValue}
                    readOnly={viewMode}
                    error={error?.local_branch_name}
                />
            </InputSection>
            <InputSection
                title={strings.localUnitsFormLocalUnitName}
                description={strings.localUnitsFormEnglishDescription}
            >
                <TextInput
                    name="english_branch_name"
                    value={value.english_branch_name}
                    onChange={setFieldValue}
                    readOnly={viewMode}
                    error={error?.english_branch_name}
                />
            </InputSection>
            {value.type === TYPE_HEALTH_CARE ? (
                <>
                    <InputSection
                        title={strings.localUnitsFormAffiliation}
                        withAsteriskOnTitle
                    >
                        <SelectInput
                            name="affiliation"
                            options={localUnitsOptions?.affiliation}
                            value={value.health?.affiliation}
                            onChange={onHealthFieldChange}
                            keySelector={localUnitAffiliationCodeSelector}
                            labelSelector={stringNameSelector}
                            readOnly={viewMode}
                            error={healthFormError?.affiliation}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.localUnitsFormOtherAffiliation}
                    >
                        <TextInput
                            name="other_affiliation"
                            value={value.health?.other_affiliation}
                            onChange={onHealthFieldChange}
                            readOnly={viewMode}
                            error={healthFormError?.other_affiliation}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.localUnitsFormFunctionality}
                        withAsteriskOnTitle
                    >
                        <SelectInput
                            name="functionality"
                            options={localUnitsOptions?.functionality}
                            value={value.health?.functionality}
                            onChange={onHealthFieldChange}
                            keySelector={localUnitAffiliationCodeSelector}
                            labelSelector={stringNameSelector}
                            readOnly={viewMode}
                            error={healthFormError?.functionality}
                        />
                    </InputSection>
                </>
            ) : (
                <>
                    <InputSection
                        title={strings.localUnitsFormCoverage}
                    >
                        <SelectInput
                            name="level"
                            options={localUnitsOptions?.level}
                            value={value.level}
                            onChange={setFieldValue}
                            keySelector={localUnitCoverageLevelSelector}
                            labelSelector={stringNameSelector}
                            readOnly={viewMode}
                            error={error?.level}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.localUnitsFormFocalPerson}
                        description={strings.localUnitsFormLocalDescription}
                        withAsteriskOnTitle
                    >
                        <TextInput
                            name="focal_person_loc"
                            value={value.focal_person_loc}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.focal_person_loc}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.localUnitsFormFocalPerson}
                        description={strings.localUnitsFormEnglishDescription}
                    >
                        <TextInput
                            name="focal_person_en"
                            value={value.focal_person_en}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.focal_person_en}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.localUnitsFormSource}
                    >
                        <TextInput
                            name="source_en"
                            value={value.source_en}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.source_en}
                        />
                    </InputSection>
                </>
            )}
            <Container
                heading={strings.localUnitsAddressTitle}
                withHeaderBorder
                contentViewType="grid"
                numPreferredGridContentColumns={2}
            >
                <div>
                    <InputSection
                        title={strings.localUnitsFormAddress}
                        description={strings.localUnitsFormEnglishDescription}
                    >
                        <TextInput
                            name="address_en"
                            value={value.address_en}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.address_en}
                        />
                    </InputSection>
                    {value.type !== TYPE_HEALTH_CARE ? (
                        <InputSection
                            title={strings.localUnitsFormAddress}
                            description={strings.localUnitsFormLocalDescription}
                        >
                            <TextInput
                                name="address_loc"
                                value={value.address_loc}
                                onChange={setFieldValue}
                                readOnly={viewMode}
                                error={error?.address_loc}
                            />
                        </InputSection>
                    ) : null}
                    <InputSection
                        title={strings.localUnitsFormLocality}
                        description={strings.localUnitsFormEnglishDescription}
                    >
                        <TextInput
                            name="city_en"
                            value={value.city_en}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.city_en}
                        />
                    </InputSection>
                    {value.type !== TYPE_HEALTH_CARE ? (
                        <InputSection
                            title={strings.localUnitsFormLocality}
                            description={strings.localUnitsFormLocalDescription}
                        >
                            <TextInput
                                name="city_loc"
                                value={value.city_loc}
                                onChange={setFieldValue}
                                readOnly={viewMode}
                                error={error?.city_loc}
                            />
                        </InputSection>
                    ) : null}
                    <InputSection
                        title={strings.localUnitsFormPostCode}
                    >
                        <TextInput
                            name="postcode"
                            value={value.postcode}
                            onChange={setFieldValue}
                            readOnly={viewMode}
                            error={error?.postcode}
                        />
                    </InputSection>
                </div>
                <div>
                    {value.type !== TYPE_HEALTH_CARE ? (
                        <>
                            <InputSection
                                title={strings.localUnitsFormPhone}
                            >
                                <TextInput
                                    name="phone"
                                    value={value.phone}
                                    onChange={setFieldValue}
                                    readOnly={viewMode}
                                    error={error?.phone}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormEmail}
                            >
                                <TextInput
                                    name="email"
                                    value={value.email}
                                    onChange={setFieldValue}
                                    readOnly={viewMode}
                                    error={error?.email}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormWebsite}
                            >
                                <TextInput
                                    name="link"
                                    value={value.link}
                                    onChange={setFieldValue}
                                    readOnly={viewMode}
                                    error={error?.link}
                                />
                            </InputSection>
                        </>
                    ) : (
                        <>
                            <InputSection
                                title={strings.localUnitsFormFocalPointName}
                            >
                                <TextInput
                                    name="focal_person_en"
                                    value={value.focal_person_en}
                                    onChange={setFieldValue}
                                    readOnly={viewMode}
                                    error={error?.focal_person_en}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormFocalPointPosition}
                            >
                                <TextInput
                                    name="focal_point_position"
                                    value={value.health?.focal_point_position}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.focal_point_position}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormFocalPointEmail}
                                withAsteriskOnTitle
                            >
                                <TextInput
                                    name="focal_point_email"
                                    value={value.health?.focal_point_email}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.focal_point_email}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormFocalPointPhoneNumber}
                            >
                                <TextInput
                                    name="focal_point_phone_number"
                                    value={value.health?.focal_point_phone_number}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.focal_point_phone_number}
                                />
                            </InputSection>
                        </>
                    )}
                </div>
            </Container>
            {value.type === TYPE_HEALTH_CARE && (
                <>
                    <Container
                        heading={strings.localUnitsFacilityCategoryTitle}
                        withHeaderBorder
                        childrenContainerClassName={styles.addressContainer}
                    >
                        <div>
                            <InputSection
                                title={strings.localUnitsFormHealthFacilityType}
                                withAsteriskOnTitle
                            >
                                <SelectInput
                                    name="health_facility_type"
                                    options={localUnitsOptions?.health_facility_type}
                                    value={value.health?.health_facility_type}
                                    onChange={onHealthFieldChange}
                                    keySelector={localUnitHealthFacilityCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={healthFormError?.health_facility_type}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormOtherFacilityType}
                            >
                                <TextInput
                                    name="other_facility_type"
                                    value={value.health?.other_facility_type}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.other_facility_type}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormHealthFacilityType}
                            >
                                <SelectInput
                                    name="primary_health_care_center"
                                    options={localUnitsOptions?.primary_health_care_center}
                                    value={value.health?.primary_health_care_center}
                                    onChange={onHealthFieldChange}
                                    keySelector={LocalUnitPrimaryHealthCareCenterCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={healthFormError?.primary_health_care_center}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormSpecialties}
                            >
                                <TextInput
                                    name="speciality"
                                    value={value.health?.speciality}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.speciality}
                                />
                            </InputSection>
                        </div>
                        <div>
                            <InputSection
                                title={strings.localUnitsFormHospitalType}
                                withAsteriskOnTitle
                            >
                                <SelectInput
                                    name="hospital_type"
                                    options={localUnitsOptions?.hospital_type}
                                    value={value.health?.hospital_type}
                                    onChange={onHealthFieldChange}
                                    keySelector={LocalUnitPrimaryHealthCareCenterCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={healthFormError?.hospital_type}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormTeachingHospital}
                                withAsteriskOnTitle
                            >
                                <BooleanInput
                                    name="is_teaching_hospital"
                                    value={value.health?.is_teaching_hospital}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.is_teaching_hospital}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormInPatientCapacity}
                                withAsteriskOnTitle
                            >
                                <BooleanInput
                                    name="is_in_patient_capacity"
                                    value={value.health?.is_in_patient_capacity}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.is_in_patient_capacity}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormIsolationRoomsWards}
                                withAsteriskOnTitle
                            >
                                <BooleanInput
                                    name="is_isolation_rooms_wards"
                                    value={value.health?.is_isolation_rooms_wards}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.is_isolation_rooms_wards}
                                />
                            </InputSection>
                        </div>
                    </Container>
                    <Container
                        heading={strings.localUnitsFacilityCapacityTitle}
                        withHeaderBorder
                        childrenContainerClassName={styles.addressContainer}
                    >
                        <div>
                            <InputSection
                                title={strings.localUnitsFormMaximumCapacity}
                            >
                                <NumberInput
                                    name="maximum_capacity"
                                    value={value.health?.maximum_capacity}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.maximum_capacity,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormNumberOfIsolationRooms}
                            >
                                <NumberInput
                                    name="number_of_isolation_rooms"
                                    value={value.health?.number_of_isolation_rooms}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.number_of_isolation_rooms,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormWarehousing}
                            >
                                <BooleanInput
                                    name="is_warehousing"
                                    value={value.health?.is_warehousing}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.is_warehousing,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormColdChain}
                            >
                                <BooleanInput
                                    name="is_cold_chain"
                                    value={value.health?.is_cold_chain}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.is_cold_chain,
                                    )}
                                />
                            </InputSection>
                        </div>
                        <div>
                            <InputSection
                                title={strings.localUnitsFormAmbulanceTypeA}
                            >
                                <NumberInput
                                    name="ambulance_type_a"
                                    value={value.health?.ambulance_type_a}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.ambulance_type_a,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormAmbulanceTypeB}
                            >
                                <NumberInput
                                    name="ambulance_type_b"
                                    value={value.health?.ambulance_type_b}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.ambulance_type_b,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormAmbulanceTypeC}
                            >
                                <NumberInput
                                    name="ambulance_type_c"
                                    value={value.health?.ambulance_type_c}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.ambulance_type_c,
                                    )}
                                />
                            </InputSection>
                        </div>
                    </Container>
                    <Container
                        heading={strings.localUnitsServicesTitle}
                        withHeaderBorder
                        childrenContainerClassName={styles.addressContainer}
                    >
                        <div>
                            <InputSection
                                title={strings.localUnitsFormGeneralMedicalServices}
                            >
                                <MultiSelectInput
                                    name="general_medical_services"
                                    options={localUnitsOptions?.general_medical_services}
                                    value={value.health?.general_medical_services}
                                    onChange={onHealthFieldChange}
                                    keySelector={localUnitGeneralMedicalCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.general_medical_services,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormSpecializedMedicalService}
                                withAsteriskOnTitle
                            >
                                <MultiSelectInput
                                    name="specialized_medical_beyond_primary_level"
                                    options={localUnitsOptions?.specialized_medical_services}
                                    value={value.health?.specialized_medical_beyond_primary_level}
                                    onChange={onHealthFieldChange}
                                    keySelector={LocalUnitProfessionalTrainingCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.specialized_medical_beyond_primary_level,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormOtherServices}
                            >
                                <TextInput
                                    name="other_services"
                                    value={value.health?.other_services}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.other_services}
                                />
                            </InputSection>
                        </div>
                        <div>
                            <InputSection
                                title={strings.localUnitsFormBloodServices}
                                withAsteriskOnTitle
                            >
                                <MultiSelectInput
                                    name="blood_services"
                                    options={localUnitsOptions?.blood_services}
                                    value={value.health?.blood_services}
                                    onChange={onHealthFieldChange}
                                    keySelector={localUnitBloodServicesCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={getErrorString(healthFormError?.blood_services)}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormProfessionalTrainingFacilities}
                            >
                                <MultiSelectInput
                                    name="professional_training_facilities"
                                    options={localUnitsOptions?.professional_training_facilities}
                                    value={value.health?.professional_training_facilities}
                                    onChange={onHealthFieldChange}
                                    keySelector={LocalUnitProfessionalTrainingCodeSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.professional_training_facilities,
                                    )}
                                />
                            </InputSection>
                        </div>
                    </Container>
                    <Container
                        heading={strings.localUnitsHumanResourcesTitle}
                        withHeaderBorder
                        childrenContainerClassName={styles.addressContainer}
                    >
                        <div>
                            <InputSection
                                title={strings.localUnitsFormTotalNumberOfHumanResources}
                            >
                                <NumberInput
                                    name="total_number_of_human_resource"
                                    value={value.health?.total_number_of_human_resource}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.total_number_of_human_resource,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormGeneralPractitioner}
                            >
                                <NumberInput
                                    name="general_practitioner"
                                    value={value.health?.general_practitioner}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.general_practitioner,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormSpecialist}
                            >
                                <NumberInput
                                    name="specialist"
                                    value={value.health?.specialist}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.specialist,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormResidentsDoctor}
                            >
                                <NumberInput
                                    name="residents_doctor"
                                    value={value.health?.residents_doctor}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.residents_doctor,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormNurse}
                            >
                                <NumberInput
                                    name="nurse"
                                    value={value.health?.nurse}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.nurse,
                                    )}
                                />
                            </InputSection>
                        </div>
                        <div>
                            <InputSection
                                title={strings.localUnitsFormDentist}
                            >
                                <NumberInput
                                    name="dentist"
                                    value={value.health?.dentist}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.dentist,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormNursingAid}
                            >
                                <NumberInput
                                    name="nursing_aid"
                                    value={value.health?.nursing_aid}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.nursing_aid,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormMidwife}
                            >
                                <NumberInput
                                    name="midwife"
                                    value={value.health?.midwife}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.midwife,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormOtherMedicalHeal}
                            >
                                <BooleanInput
                                    name="other_medical_heal"
                                    value={value.health?.other_medical_heal}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={getErrorString(
                                        healthFormError?.other_medical_heal,
                                    )}
                                />
                            </InputSection>
                            <InputSection
                                title={strings.localUnitsFormOtherProfiles}
                            >
                                <TextInput
                                    name="other_profiles"
                                    value={value.health?.other_profiles}
                                    onChange={onHealthFieldChange}
                                    readOnly={viewMode}
                                    error={healthFormError?.other_profiles}
                                />
                            </InputSection>
                        </div>
                    </Container>
                    <InputSection
                        title={strings.localUnitsFormCommentsNS}
                    >
                        <TextArea
                            name="feedback"
                            value={value.health?.feedback}
                            onChange={onHealthFieldChange}
                            readOnly={viewMode}
                            error={getErrorString(
                                healthFormError?.feedback,
                            )}
                        />
                    </InputSection>
                </>
            )}
            <Container
                // FIXME: use strings
                heading="Location"
                withHeaderBorder
            >
                <CountrySelectInput
                    // FIXME: use strings
                    label="Country"
                    name="country"
                    value={value.country}
                    onChange={setFieldValue}
                    readOnly
                />
                <BaseMapPointInput
                    name="location_json"
                    mapContainerClassName={styles.pointInputMap}
                    value={value.location_json}
                    onChange={setFieldValue}
                    onClick={handleMapPointClick}
                />
            </Container>
            <Button
                name={undefined}
                onClick={handleFormSubmit}
                disabled={addLocalUnitsPending}
            >
                {strings.localUnitsFormSubmitButtonLabel}
            </Button>
        </div>
    );
}

export default AddEditLocalUnitsForm;
