import {
    useCallback,
    useMemo,
} from 'react';
import {
    BooleanInput,
    Button,
    Checklist,
    Container,
    ListView,
    MultiSelectInput,
    NumberInput,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    getErrorObject,
    getErrorString,
    type ObjectError,
    useFormArray,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import {
    AMBULANCE_TYPE,
    HOSPITAL_TYPE,
    OTHER_TRAINING_FACILITIES,
    OTHER_TYPE,
    PRIMARY_HEALTH_TYPE,
    RESIDENTIAL_TYPE,
    SPECIALIZED_SERVICES_TYPE,
    TRAINING_FACILITY_TYPE,
} from '#utils/constants';

import { type PartialOtherProfileFields } from './HealthOtherProfileInput/schema';
import HealthOtherProfileInput from './HealthOtherProfileInput';
import { type PartialHealthFields } from './schema';

import i18n from './i18n.json';

type LocalUnitOptions = components<'read'>['schemas']['LocalUnitOptions'];

interface Props {
    value: PartialHealthFields | undefined;
    prevValue?: PartialHealthFields | null;
    setFieldValue: (...entries: EntriesAsList<PartialHealthFields>) => void;
    withPrevValue?: boolean;
    withDiffView?: boolean;
    readOnly?: boolean;
    error: ObjectError<PartialHealthFields> | undefined;
    localUnitOptions?: LocalUnitOptions;
}

function HealthFields(props: Props) {
    const {
        value,
        prevValue,
        withDiffView,
        withPrevValue,
        readOnly,
        error,
        setFieldValue,
        localUnitOptions,
    } = props;

    const strings = useTranslation(i18n);

    const {
        setValue: setOtherProfileFieldValue,
        removeValue: removeOtherProfile,
    } = useFormArray<'other_profiles', PartialOtherProfileFields>(
        'other_profiles',
        setFieldValue,
    );

    const handleOtherProfilesAddButtonClick = useCallback(
        () => {
            const newOtherProfiles: PartialOtherProfileFields = {
                client_id: randomString(),
            };

            setFieldValue(
                (oldValue: PartialOtherProfileFields[] | undefined) => (
                    [...(oldValue ?? []), newOtherProfiles]
                ),
                'other_profiles' as const,
            );
        },
        [setFieldValue],
    );

    const hasSomeOtherTrainingFacility = useMemo(() => {
        if (isNotDefined(value?.professional_training_facilities)) {
            return false;
        }
        return value?.professional_training_facilities?.some(
            (facility) => facility === OTHER_TRAINING_FACILITIES,
        );
    }, [value?.professional_training_facilities]);

    const prevOtherProfilesMapping = useMemo(() => (
        listToMap(
            prevValue?.other_profiles,
            ({ client_id }) => client_id,
        )
    ), [prevValue?.other_profiles]);

    return (
        <ListView
            layout="block"
            spacing="2xl"
        >
            <Container
                heading={strings.specialitiesAndCapacityTitle}
                headingLevel={5}
                spacing="sm"
                withHeaderBorder
            >
                <ListView layout="block">
                    <ListView layout="grid">
                        <ListView
                            layout="block"
                            withDarkBackground
                            withPadding
                        >
                            <SelectInput
                                label={strings.healthFacilityType}
                                required
                                name="health_facility_type"
                                options={localUnitOptions?.health_facility_type}
                                value={value?.health_facility_type}
                                onChange={setFieldValue}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={error?.health_facility_type}
                                prevValue={prevValue?.health_facility_type}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            {value?.health_facility_type === OTHER_TYPE && (
                                <TextInput
                                    required
                                    label={strings.otherFacilityType}
                                    name="other_facility_type"
                                    value={value?.other_facility_type}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.other_facility_type}
                                    prevValue={prevValue?.other_facility_type}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            {value?.health_facility_type === PRIMARY_HEALTH_TYPE && (
                                <SelectInput
                                    required
                                    label={strings.primaryHealthCareCenter}
                                    name="primary_health_care_center"
                                    options={localUnitOptions?.primary_health_care_center}
                                    value={value?.primary_health_care_center}
                                    onChange={setFieldValue}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={readOnly}
                                    error={error?.primary_health_care_center}
                                    prevValue={prevValue?.primary_health_care_center}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            {value?.health_facility_type === SPECIALIZED_SERVICES_TYPE && (
                                <TextInput
                                    required
                                    label={strings.specialities}
                                    name="speciality"
                                    value={value?.speciality}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.speciality}
                                    prevValue={prevValue?.speciality}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            {value?.health_facility_type === HOSPITAL_TYPE && (
                                <SelectInput
                                    label={strings.hospitalType}
                                    name="hospital_type"
                                    options={localUnitOptions?.hospital_type}
                                    value={value?.hospital_type}
                                    onChange={setFieldValue}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    readOnly={readOnly}
                                    error={error?.hospital_type}
                                    prevValue={prevValue?.hospital_type}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            {value?.health_facility_type === AMBULANCE_TYPE && (
                                <>
                                    <NumberInput
                                        label={strings.ambulanceTypeA}
                                        name="ambulance_type_a"
                                        value={value?.ambulance_type_a}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={getErrorString(error?.ambulance_type_a)}
                                        prevValue={prevValue?.ambulance_type_a}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <NumberInput
                                        label={strings.ambulanceTypeB}
                                        name="ambulance_type_b"
                                        value={value?.ambulance_type_b}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={getErrorString(error?.ambulance_type_b)}
                                        prevValue={prevValue?.ambulance_type_b}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    <NumberInput
                                        label={strings.ambulanceTypeC}
                                        name="ambulance_type_c"
                                        value={value?.ambulance_type_c}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={getErrorString(error?.ambulance_type_c)}
                                        prevValue={prevValue?.ambulance_type_c}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                </>
                            )}
                            {value?.health_facility_type === TRAINING_FACILITY_TYPE && (
                                <>
                                    <Checklist
                                        label={strings.professionalTrainingFacilities}
                                        name="professional_training_facilities"
                                        options={localUnitOptions?.professional_training_facilities}
                                        value={value?.professional_training_facilities}
                                        onChange={setFieldValue}
                                        keySelector={numericIdSelector}
                                        labelSelector={stringNameSelector}
                                        readOnly={readOnly}
                                        error={getErrorString(
                                            error?.professional_training_facilities,
                                        )}
                                        prevValue={prevValue?.professional_training_facilities}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    {hasSomeOtherTrainingFacility && (
                                        <TextInput
                                            required
                                            name="other_training_facilities"
                                            label={strings.otherTrainingFacilities}
                                            value={value?.other_training_facilities}
                                            onChange={setFieldValue}
                                            readOnly={readOnly}
                                            error={error?.other_training_facilities}
                                            prevValue={prevValue?.other_training_facilities}
                                            withPrevValue={withPrevValue}
                                            withDiffView={withDiffView}
                                        />
                                    )}
                                </>
                            )}
                            {value?.health_facility_type === HOSPITAL_TYPE && (
                                <BooleanInput
                                    required
                                    label={strings.teachingHospital}
                                    name="is_teaching_hospital"
                                    value={value?.is_teaching_hospital}
                                    onChange={setFieldValue}
                                    readOnly={readOnly}
                                    error={error?.is_teaching_hospital}
                                    prevValue={prevValue?.is_teaching_hospital}
                                    withPrevValue={withPrevValue}
                                    withDiffView={withDiffView}
                                />
                            )}
                            {(value?.health_facility_type === HOSPITAL_TYPE
                                || value?.health_facility_type === PRIMARY_HEALTH_TYPE
                                || value?.health_facility_type === SPECIALIZED_SERVICES_TYPE
                                || value?.health_facility_type === RESIDENTIAL_TYPE
                                || value?.health_facility_type === OTHER_TYPE
                            ) && (
                                <>
                                    <BooleanInput
                                        required
                                        label={strings.inPatientCapacity}
                                        name="is_in_patient_capacity"
                                        value={value?.is_in_patient_capacity}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.is_in_patient_capacity}
                                        prevValue={prevValue?.is_in_patient_capacity}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    {value?.is_in_patient_capacity && (
                                        <NumberInput
                                            required
                                            label={strings.maximumCapacity}
                                            name="maximum_capacity"
                                            value={value?.maximum_capacity}
                                            onChange={setFieldValue}
                                            readOnly={readOnly}
                                            error={getErrorString(error?.maximum_capacity)}
                                            prevValue={prevValue?.maximum_capacity}
                                            withPrevValue={withPrevValue}
                                            withDiffView={withDiffView}
                                        />
                                    )}
                                    <BooleanInput
                                        required
                                        label={strings.isolationRoomsWards}
                                        name="is_isolation_rooms_wards"
                                        value={value?.is_isolation_rooms_wards}
                                        onChange={setFieldValue}
                                        readOnly={readOnly}
                                        error={error?.is_isolation_rooms_wards}
                                        prevValue={prevValue?.is_isolation_rooms_wards}
                                        withPrevValue={withPrevValue}
                                        withDiffView={withDiffView}
                                    />
                                    {value?.is_isolation_rooms_wards && (
                                        <NumberInput
                                            required
                                            label={strings.numberOfIsolationRooms}
                                            name="number_of_isolation_rooms"
                                            value={value?.number_of_isolation_rooms}
                                            onChange={setFieldValue}
                                            readOnly={readOnly}
                                            error={getErrorString(
                                                error?.number_of_isolation_rooms,
                                            )}
                                            prevValue={prevValue?.number_of_isolation_rooms}
                                            withPrevValue={withPrevValue}
                                            withDiffView={withDiffView}
                                        />
                                    )}
                                </>
                            )}
                        </ListView>
                        <ListView layout="block">
                            <MultiSelectInput
                                required
                                label={strings.generalMedicalServices}
                                name="general_medical_services"
                                options={localUnitOptions?.general_medical_services}
                                value={value?.general_medical_services}
                                onChange={setFieldValue}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(error?.general_medical_services)}
                                prevValue={prevValue?.general_medical_services}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <MultiSelectInput
                                label={strings.specializedMedicalService}
                                required
                                name="specialized_medical_beyond_primary_level"
                                options={localUnitOptions?.specialized_medical_beyond_primary_level}
                                value={value?.specialized_medical_beyond_primary_level}
                                onChange={setFieldValue}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(
                                    error?.specialized_medical_beyond_primary_level,
                                )}
                                prevValue={prevValue?.specialized_medical_beyond_primary_level}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <MultiSelectInput
                                label={strings.bloodServices}
                                required
                                name="blood_services"
                                options={localUnitOptions?.blood_services}
                                value={value?.blood_services}
                                onChange={setFieldValue}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                readOnly={readOnly}
                                error={getErrorString(error?.blood_services)}
                                prevValue={prevValue?.blood_services}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <TextInput
                                label={strings.otherServices}
                                name="other_services"
                                value={value?.other_services}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={error?.other_services}
                                prevValue={prevValue?.other_services}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                        </ListView>
                    </ListView>
                    <Container
                        heading={strings.qualifiersTitle}
                        headingLevel={6}
                        spacing="sm"
                        withPadding
                        withDarkBackground
                    >
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={4}
                        >
                            <BooleanInput
                                clearable
                                label={strings.warehousing}
                                name="is_warehousing"
                                value={value?.is_warehousing}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.is_warehousing)}
                                prevValue={prevValue?.is_warehousing}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <BooleanInput
                                clearable
                                label={strings.coldChain}
                                name="is_cold_chain"
                                value={value?.is_cold_chain}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.is_cold_chain)}
                                prevValue={prevValue?.is_cold_chain}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <BooleanInput
                                clearable
                                label={strings.otherMedicalHeal}
                                name="other_medical_heal"
                                value={value?.other_medical_heal}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.other_medical_heal)}
                                prevValue={prevValue?.other_medical_heal}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                        </ListView>
                    </Container>
                </ListView>
            </Container>
            <Container
                heading={strings.humanResourcesTitle}
                headingLevel={5}
                spacing="sm"
                withHeaderBorder
            >
                <ListView layout="block">
                    <ListView
                        layout="grid"
                        withDarkBackground
                        withPadding
                    >
                        <ListView layout="block">
                            <NumberInput
                                label={strings.totalNumberOfHumanResources}
                                name="total_number_of_human_resource"
                                value={value?.total_number_of_human_resource}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.total_number_of_human_resource)}
                                prevValue={prevValue?.total_number_of_human_resource}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.generalPractitioner}
                                name="general_practitioner"
                                value={value?.general_practitioner}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.general_practitioner)}
                                prevValue={prevValue?.general_practitioner}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.specialist}
                                name="specialist"
                                value={value?.specialist}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.specialist)}
                                prevValue={prevValue?.specialist}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.residentsDoctor}
                                name="residents_doctor"
                                value={value?.residents_doctor}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.residents_doctor)}
                                prevValue={prevValue?.residents_doctor}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.nurse}
                                name="nurse"
                                value={value?.nurse}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.nurse)}
                                prevValue={prevValue?.nurse}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                        </ListView>
                        <ListView layout="block">
                            <NumberInput
                                label={strings.dentist}
                                name="dentist"
                                value={value?.dentist}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.dentist)}
                                prevValue={prevValue?.dentist}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.nursingAid}
                                name="nursing_aid"
                                value={value?.nursing_aid}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.nursing_aid)}
                                prevValue={prevValue?.nursing_aid}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.midwife}
                                name="midwife"
                                value={value?.midwife}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.midwife)}
                                prevValue={prevValue?.midwife}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                            <NumberInput
                                label={strings.pharmacists}
                                name="pharmacists"
                                value={value?.pharmacists}
                                onChange={setFieldValue}
                                readOnly={readOnly}
                                error={getErrorString(error?.pharmacists)}
                                prevValue={prevValue?.pharmacists}
                                withPrevValue={withPrevValue}
                                withDiffView={withDiffView}
                            />
                        </ListView>
                    </ListView>
                    <Container
                        heading={strings.otherProfilesHeading}
                        headingLevel={6}
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            {value?.other_profiles?.map((profile, i) => (
                                <HealthOtherProfileInput
                                    key={profile.client_id}
                                    index={i}
                                    value={profile}
                                    onChange={setOtherProfileFieldValue}
                                    onRemove={removeOtherProfile}
                                    error={getErrorObject(error?.other_profiles)}
                                    readOnly={readOnly}
                                    withDiffView={withDiffView}
                                    prevValue={prevOtherProfilesMapping?.[profile.client_id]}
                                    withPrevValue={withPrevValue}
                                />
                            ))}
                            {!readOnly && (
                                <Button
                                    name={undefined}
                                    disabled={readOnly}
                                    onClick={handleOtherProfilesAddButtonClick}
                                >
                                    {strings.addOtherProfilesButtonLabel}
                                </Button>
                            )}
                        </ListView>
                    </Container>
                </ListView>
            </Container>
            <TextArea
                label={strings.commentsNS}
                name="feedback"
                value={value?.feedback}
                onChange={setFieldValue}
                readOnly={readOnly}
                error={error?.feedback}
                prevValue={prevValue?.feedback}
                withPrevValue={withPrevValue}
                withDiffView={withDiffView}
            />
        </ListView>
    );
}

export default HealthFields;
