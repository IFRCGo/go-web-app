import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    injectClientId,
    numericIdSelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DiffWrapper from '#components/DiffWrapper';
import MultiSelectDiffWrapper from '#components/MultiSelectDiffWrapper';
import MultiSelectOutput from '#components/MultiSelectOutput';
import SelectDiffWrapper from '#components/SelectDiffWrapper';
import SelectOutput from '#components/SelectOutput';
import useCountry from '#hooks/domain/useCountry';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import hasDifferences, { getFormFields } from '#utils/localUnits';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { injectClientIdToResponse } from '../common';
import {
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from '../LocalUnitsFormModal/schema';
import OtherProfilesDiffOutput from './OtherProfilesDiffOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type VisibilityOptions = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['api_visibility_choices']>[number]
type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;

interface Props {
    localUnitId?: number;
    locallyChangedValue?: PartialLocalUnits;
}

const visibilityKeySelector = (option: VisibilityOptions) => option.key;

function LocalUnitView(props: Props) {
    const {
        localUnitId,
        locallyChangedValue,
    } = props;

    const strings = useTranslation(i18n);
    const { api_visibility_choices: visibilityOptions } = useGlobalEnums();
    const countries = useCountry();
    const {
        response: localUnitsOptions,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const {
        response: localUnitResponse,
        pending: localUnitResponsePending,
        error: localUnitResponseError,
    } = useRequest({
        skip: isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

    const {
        response: localUnitPreviousResponse,
        pending: localUnitPreviousResponsePending,
    } = useRequest({
        skip: isDefined(locallyChangedValue) || isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/latest-change-request/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

    const previousValue = injectClientIdToResponse(
        // eslint-disable-next-line max-len
        localUnitPreviousResponse?.previous_data_details as unknown as (LocalUnitResponse | undefined),
    );

    const newValue = isDefined(locallyChangedValue)
        ? locallyChangedValue
        : injectClientIdToResponse(localUnitResponse);

    const oldValue = isDefined(locallyChangedValue)
        ? injectClientIdToResponse(localUnitResponse)
        : previousValue;

    const getPreviousProfileValue = useCallback((profileClientId: string) => (
        oldValue?.health?.other_profiles?.find(
            (previousProfile) => injectClientId(previousProfile)?.client_id === profileClientId,
        )
    ), [oldValue]);

    const removedOtherProfiles = useMemo(() => (
        oldValue?.health?.other_profiles?.filter(({ client_id: oldClientId }) => (
            newValue?.health?.other_profiles?.findIndex(
                ({ client_id: newClientId }) => oldClientId === newClientId,
            ) === -1
        ))
    ), [oldValue, newValue]);

    const changedOtherProfiles = useMemo(() => {
        const potentiallyChanged = newValue?.health?.other_profiles?.filter(
            (newOne) => {
                const oldOne = oldValue?.health?.other_profiles?.find(
                    ({ client_id: oldClientId }) => newOne.client_id === oldClientId,
                );

                return hasDifferences(newOne, oldOne);
            },
        );

        return potentiallyChanged;
    }, [oldValue, newValue]);

    const hasDifference = useMemo(() => {
        if (isNotDefined(newValue) && isNotDefined(oldValue)) {
            return false;
        }

        const newFormFields = getFormFields(newValue);
        const oldFormFields = getFormFields(oldValue);

        return hasDifferences(newFormFields, oldFormFields);
    }, [newValue, oldValue]);

    return (
        <Container
            pending={localUnitResponsePending || localUnitPreviousResponsePending}
            errored={!!localUnitResponseError}
            empty={!hasDifference}
            emptyMessage={strings.localUnitViewNoChanges}
            footer={isDefined(newValue?.update_reason_overview)
                && isNotDefined(locallyChangedValue) && (
                <TextOutput
                    valueClassName={styles.updateReasonText}
                    strongLabel
                    value={newValue?.update_reason_overview}
                    label={strings.localUnitViewUpdateReason}
                    withBlockLayout
                />
            )}
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={2}
                spacing="2xs"
            >
                <SelectDiffWrapper
                    showOnlyDiff
                    value={newValue?.type}
                    oldValue={oldValue?.type}
                    options={localUnitsOptions?.type}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    enabled
                >
                    <SelectOutput
                        label={strings.localUnitViewType}
                        options={localUnitsOptions?.type}
                        value={newValue?.type}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        withBackground
                    />
                </SelectDiffWrapper>
                <SelectDiffWrapper
                    showOnlyDiff
                    value={newValue?.visibility}
                    oldValue={oldValue?.visibility}
                    options={visibilityOptions}
                    keySelector={visibilityKeySelector}
                    labelSelector={stringValueSelector}
                    enabled
                >
                    <SelectOutput
                        label={strings.localUnitViewVisibility}
                        options={visibilityOptions}
                        value={newValue?.visibility}
                        keySelector={visibilityKeySelector}
                        labelSelector={stringValueSelector}
                        withBackground
                    />
                </SelectDiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    diffViewEnabled
                    previousValue={oldValue?.location_json?.lat}
                    value={newValue?.location_json?.lat}
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLatitude}
                        value={newValue?.location_json?.lat}
                        valueType="number"
                        maximumFractionDigits={10}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    diffViewEnabled
                    previousValue={oldValue?.location_json?.lng}
                    value={newValue?.location_json?.lng}
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLongitude}
                        value={newValue?.location_json?.lng}
                        valueType="number"
                        maximumFractionDigits={10}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.date_of_data}
                    previousValue={oldValue?.date_of_data}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewDateOfUpdate}
                        value={newValue?.date_of_data}
                        valueType="date"
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.subtype}
                    previousValue={oldValue?.subtype}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewSubtype}
                        value={newValue?.subtype}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.english_branch_name}
                    previousValue={oldValue?.english_branch_name}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLocalUnitNameEn}
                        value={newValue?.english_branch_name}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.local_branch_name}
                    previousValue={oldValue?.local_branch_name}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLocalUnitNameLocal}
                        value={newValue?.local_branch_name}
                        withBackground
                    />
                </DiffWrapper>
                {newValue?.type !== TYPE_HEALTH_CARE && (
                    <SelectDiffWrapper
                        showOnlyDiff
                        value={newValue?.level}
                        oldValue={oldValue?.level}
                        options={localUnitsOptions?.level}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewCoverage}
                            options={localUnitsOptions?.level}
                            value={newValue?.level}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            withBackground
                        />
                    </SelectDiffWrapper>
                )}
                {newValue?.type !== TYPE_HEALTH_CARE && (
                    <>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.focal_person_en}
                            previousValue={oldValue?.focal_person_en}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewFocalPersonEn}
                                value={newValue?.focal_person_en}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.focal_person_loc}
                            previousValue={oldValue?.focal_person_loc}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewFocalPersonLocal}
                                value={newValue?.focal_person_loc}
                                withBackground
                            />
                        </DiffWrapper>
                    </>
                )}
                {newValue?.type !== TYPE_HEALTH_CARE && (
                    <>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.source_en}
                            previousValue={oldValue?.source_en}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewSourceEn}
                                value={newValue?.source_en}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.source_loc}
                            previousValue={oldValue?.source_loc}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewSourceLocal}
                                value={newValue?.source_loc}
                                withBackground
                            />
                        </DiffWrapper>
                    </>
                )}
                {newValue?.type === TYPE_HEALTH_CARE && (
                    <>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.affiliation}
                            oldValue={oldValue?.health?.affiliation}
                            options={localUnitsOptions?.affiliation}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewAffiliation}
                                options={localUnitsOptions?.affiliation}
                                value={newValue?.health?.affiliation}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.other_affiliation}
                            previousValue={oldValue?.health?.other_affiliation}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewOtherAffiliation}
                                value={newValue?.health?.other_affiliation}
                                withBackground
                            />
                        </DiffWrapper>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.functionality}
                            oldValue={oldValue?.health?.functionality}
                            options={localUnitsOptions?.functionality}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewFunctionality}
                                options={localUnitsOptions?.functionality}
                                value={newValue?.health?.functionality}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.hospital_type}
                            oldValue={oldValue?.health?.hospital_type}
                            options={localUnitsOptions?.hospital_type}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewHospitalType}
                                options={localUnitsOptions?.hospital_type}
                                value={newValue?.health?.hospital_type}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.is_teaching_hospital}
                            previousValue={
                                oldValue?.health?.is_teaching_hospital
                            }
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewTeachingHospital}
                                value={newValue?.health?.is_teaching_hospital}
                                valueType="boolean"
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.is_teaching_hospital}
                            previousValue={
                                oldValue?.health?.is_teaching_hospital
                            }
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewInPatientCapacity}
                                value={newValue?.health?.is_in_patient_capacity}
                                valueType="boolean"
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.is_teaching_hospital}
                            previousValue={
                                oldValue?.health?.is_teaching_hospital
                            }
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewIsolationRoomsWards}
                                value={newValue?.health?.is_isolation_rooms_wards}
                                valueType="boolean"
                                withBackground
                            />
                        </DiffWrapper>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.country}
                            oldValue={oldValue?.country}
                            options={countries}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewCountry}
                                options={countries}
                                value={newValue?.country}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                    </>
                )}
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.address_en}
                    previousValue={oldValue?.address_en}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewAddressEn}
                        value={newValue?.address_en}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.address_loc}
                    previousValue={oldValue?.address_loc}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewAddressLocal}
                        value={newValue?.address_loc}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.city_en}
                    previousValue={oldValue?.city_en}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLocalityEn}
                        value={newValue?.city_en}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.city_loc}
                    previousValue={oldValue?.city_loc}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewLocalityLocal}
                        value={newValue?.city_loc}
                        withBackground
                    />
                </DiffWrapper>
                <DiffWrapper
                    hideOnPristine
                    value={newValue?.postcode}
                    previousValue={oldValue?.postcode}
                    diffViewEnabled
                >
                    <TextOutput
                        strongLabel
                        label={strings.localUnitViewPostCode}
                        value={newValue?.postcode}
                        withBackground
                    />
                </DiffWrapper>
                {newValue?.type !== TYPE_HEALTH_CARE && (
                    <>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.phone}
                            previousValue={oldValue?.phone}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewPhone}
                                value={newValue?.phone}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.email}
                            previousValue={oldValue?.email}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewEmail}
                                value={newValue?.email}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.link}
                            previousValue={oldValue?.link}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewWebsite}
                                value={newValue?.link}
                                valueType="text"
                                withBackground
                            />
                        </DiffWrapper>
                    </>
                )}
                {newValue?.type === TYPE_HEALTH_CARE && (
                    <>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.health_facility_type}
                            oldValue={oldValue?.health?.health_facility_type}
                            options={localUnitsOptions?.health_facility_type}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewHealthFacilityType}
                                options={localUnitsOptions?.health_facility_type}
                                value={newValue?.health?.health_facility_type}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.other_facility_type}
                            previousValue={oldValue?.health?.other_facility_type}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewOtherFacilityType}
                                value={newValue?.health?.other_facility_type}
                                withBackground
                            />
                        </DiffWrapper>
                        <SelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.primary_health_care_center}
                            oldValue={oldValue?.health?.primary_health_care_center}
                            options={localUnitsOptions?.primary_health_care_center}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <SelectOutput
                                label={strings.localUnitViewPrimaryHealthCareCenter}
                                options={localUnitsOptions?.primary_health_care_center}
                                value={newValue?.health?.primary_health_care_center}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </SelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.speciality}
                            previousValue={oldValue?.health?.speciality}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewSpecialties}
                                value={newValue?.health?.speciality}
                                withBackground
                            />
                        </DiffWrapper>
                        <MultiSelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.general_medical_services}
                            oldValue={oldValue?.health?.general_medical_services}
                            options={localUnitsOptions?.general_medical_services}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <MultiSelectOutput
                                label={strings.localUnitViewGeneralMedicalServices}
                                options={localUnitsOptions?.general_medical_services}
                                value={newValue?.health?.general_medical_services}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </MultiSelectDiffWrapper>
                        <MultiSelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.specialized_medical_beyond_primary_level}
                            oldValue={oldValue?.health?.specialized_medical_beyond_primary_level}
                            options={localUnitsOptions?.specialized_medical_beyond_primary_level}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <MultiSelectOutput
                                label={strings.localUnitViewSpecializedMedicalService}
                                options={localUnitsOptions
                                    ?.specialized_medical_beyond_primary_level}
                                value={newValue?.health?.specialized_medical_beyond_primary_level}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </MultiSelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.other_services}
                            previousValue={oldValue?.health?.other_services}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewOtherServices}
                                value={newValue?.health?.other_services}
                                withBackground
                            />
                        </DiffWrapper>
                        <MultiSelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.blood_services}
                            oldValue={oldValue?.health?.blood_services}
                            options={localUnitsOptions?.blood_services}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <MultiSelectOutput
                                label={strings.localUnitViewBloodServices}
                                options={localUnitsOptions?.blood_services}
                                value={newValue?.health?.blood_services}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </MultiSelectDiffWrapper>
                        <MultiSelectDiffWrapper
                            showOnlyDiff
                            value={newValue?.health?.professional_training_facilities}
                            oldValue={oldValue?.health?.professional_training_facilities}
                            options={localUnitsOptions?.professional_training_facilities}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                            enabled
                        >
                            <MultiSelectOutput
                                label={strings.localUnitViewProfessionalTrainingFacilities}
                                options={localUnitsOptions?.professional_training_facilities}
                                value={newValue?.health?.professional_training_facilities}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                withBackground
                            />
                        </MultiSelectDiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.number_of_isolation_rooms}
                            previousValue={oldValue?.health?.number_of_isolation_rooms}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewNumberOfIsolationRooms}
                                value={newValue?.health?.number_of_isolation_rooms}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.maximum_capacity}
                            previousValue={oldValue?.health?.maximum_capacity}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewMaximumCapacity}
                                value={newValue?.health?.maximum_capacity}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.is_warehousing}
                            previousValue={oldValue?.health?.is_warehousing}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                valueType="boolean"
                                label={strings.localUnitViewWarehousing}
                                value={newValue?.health?.is_warehousing}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.is_cold_chain}
                            previousValue={oldValue?.health?.is_cold_chain}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                valueType="boolean"
                                label={strings.localUnitViewColdChain}
                                value={newValue?.health?.is_cold_chain}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.ambulance_type_a}
                            previousValue={oldValue?.health?.ambulance_type_a}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewAmbulanceTypeA}
                                value={newValue?.health?.ambulance_type_a}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.ambulance_type_b}
                            previousValue={oldValue?.health?.ambulance_type_b}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewAmbulanceTypeB}
                                value={newValue?.health?.ambulance_type_b}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.ambulance_type_c}
                            previousValue={oldValue?.health?.ambulance_type_c}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewAmbulanceTypeC}
                                value={newValue?.health?.ambulance_type_c}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.total_number_of_human_resource}
                            previousValue={oldValue?.health?.total_number_of_human_resource}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewTotalNumberOfHumanResources}
                                value={newValue?.health?.total_number_of_human_resource}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.general_practitioner}
                            previousValue={oldValue?.health?.general_practitioner}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewGeneralPractitioner}
                                value={newValue?.health?.general_practitioner}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.specialist}
                            previousValue={oldValue?.health?.specialist}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewSpecialist}
                                value={newValue?.health?.specialist}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.residents_doctor}
                            previousValue={oldValue?.health?.residents_doctor}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewResidentsDoctor}
                                value={newValue?.health?.residents_doctor}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.nurse}
                            previousValue={oldValue?.health?.nurse}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewNurse}
                                value={newValue?.health?.nurse}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.dentist}
                            previousValue={oldValue?.health?.dentist}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewDentist}
                                value={newValue?.health?.dentist}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.nursing_aid}
                            previousValue={oldValue?.health?.nursing_aid}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewNursingAid}
                                value={newValue?.health?.nursing_aid}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.midwife}
                            previousValue={oldValue?.health?.midwife}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewMidwife}
                                value={newValue?.health?.midwife}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.pharmacists}
                            previousValue={oldValue?.health?.pharmacists}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewPharmacists}
                                value={newValue?.health?.pharmacists}
                                withBackground
                            />
                        </DiffWrapper>
                        {isDefined(changedOtherProfiles) && changedOtherProfiles.length > 0 && (
                            <>
                                <span>
                                    {strings.localUnitViewOtherProfiles}
                                </span>
                                {newValue?.health?.other_profiles?.map((profile) => (
                                    <OtherProfilesDiffOutput
                                        key={profile.client_id}
                                        newValue={profile}
                                        oldValue={getPreviousProfileValue(profile.client_id)}
                                        withBackground
                                    />
                                ))}
                            </>
                        )}
                        {isDefined(removedOtherProfiles) && removedOtherProfiles.length > 0 && (
                            <>
                                <span>
                                    {strings.localUnitViewRemovedOtherProfiles}
                                </span>
                                {removedOtherProfiles?.map((profile) => (
                                    <OtherProfilesDiffOutput
                                        key={profile.client_id}
                                        newValue={profile}
                                        oldValue={undefined}
                                        withBackground
                                    />
                                ))}
                            </>
                        )}
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.other_medical_heal}
                            previousValue={oldValue?.health?.other_medical_heal}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                valueType="boolean"
                                label={strings.localUnitViewOtherMedicalHeal}
                                value={newValue?.health?.other_medical_heal}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.feedback}
                            previousValue={oldValue?.health?.feedback}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewCommentsNS}
                                value={newValue?.health?.feedback}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.focal_point_position}
                            previousValue={oldValue?.health?.focal_point_position}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewFocalPointPosition}
                                value={newValue?.health?.focal_point_position}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.focal_point_email}
                            previousValue={oldValue?.health?.focal_point_email}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewFocalPointEmail}
                                value={newValue?.health?.focal_point_email}
                                withBackground
                            />
                        </DiffWrapper>
                        <DiffWrapper
                            hideOnPristine
                            value={newValue?.health?.focal_point_phone_number}
                            previousValue={oldValue?.health?.focal_point_phone_number}
                            diffViewEnabled
                        >
                            <TextOutput
                                strongLabel
                                label={strings.localUnitViewFocalPointPhoneNumber}
                                value={newValue?.health?.focal_point_phone_number}
                                withBackground
                            />
                        </DiffWrapper>
                    </>
                )}
            </ListView>
        </Container>
    );
}

export default LocalUnitView;
