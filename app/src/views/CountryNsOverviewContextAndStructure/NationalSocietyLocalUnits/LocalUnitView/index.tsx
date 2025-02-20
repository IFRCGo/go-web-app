import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DiffWrapper from '#components/DiffWrapper';
import MultiSelectOutput from '#components/MultiSelectOutput';
import SelectOutput from '#components/SelectOutput';
import useCountry from '#hooks/domain/useCountry';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    type PartialLocalUnits,
    TYPE_HEALTH_CARE,
} from '../LocalUnitsFormModal/LocalUnitsForm/schema';

import i18n from './i18n.json';

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
        // error: localUnitPreviousResponseError,
    } = useRequest({
        skip: isDefined(locallyChangedValue) || isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/latest-change-request/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

    const newValue = isDefined(locallyChangedValue)
        ? locallyChangedValue
        : localUnitResponse;
    const oldValue = isDefined(locallyChangedValue)
        ? localUnitResponse
        : (localUnitPreviousResponse?.previous_data_details as unknown as LocalUnitResponse);

    // FIXME: Handle case when there is no change.
    // We need to display message to the user

    return (
        <Container
            contentViewType="vertical"
            pending={localUnitResponsePending || localUnitPreviousResponsePending}
            errored={!!localUnitResponseError}
        >
            <DiffWrapper
                showOnlyDiff
                value={newValue?.type}
                oldValue={oldValue?.type}
                enabled
            >
                <SelectOutput
                    label={strings.localUnitViewType}
                    options={localUnitsOptions?.type}
                    value={newValue?.type}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.visibility}
                oldValue={oldValue?.visibility}
                enabled
            >
                <SelectOutput
                    label={strings.localUnitViewVisibility}
                    options={visibilityOptions}
                    value={newValue?.visibility}
                    keySelector={visibilityKeySelector}
                    labelSelector={stringValueSelector}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                enabled
                oldValue={oldValue?.location_json?.lat}
                value={newValue?.location_json?.lat}
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLatitude}
                    value={newValue?.location_json?.lat}
                    valueType="number"
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                enabled
                oldValue={oldValue?.location_json?.lng}
                value={newValue?.location_json?.lng}
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLongitude}
                    value={newValue?.location_json?.lng}
                    valueType="number"
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.date_of_data}
                oldValue={oldValue?.date_of_data}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewDateOfUpdate}
                    value={newValue?.date_of_data}
                    valueType="date"
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.subtype}
                oldValue={oldValue?.subtype}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewSubtype}
                    value={newValue?.subtype}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.english_branch_name}
                oldValue={oldValue?.english_branch_name}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLocalUnitNameEn}
                    value={newValue?.english_branch_name}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.local_branch_name}
                oldValue={oldValue?.local_branch_name}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLocalUnitNameLocal}
                    value={newValue?.local_branch_name}
                />
            </DiffWrapper>
            {newValue?.type !== TYPE_HEALTH_CARE && (
                <DiffWrapper
                    showOnlyDiff
                    value={newValue?.level}
                    oldValue={oldValue?.level}
                    enabled
                >
                    <SelectOutput
                        label={strings.localUnitViewCoverage}
                        options={localUnitsOptions?.level}
                        value={newValue?.level}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                    />
                </DiffWrapper>
            )}
            {newValue?.type !== TYPE_HEALTH_CARE && (
                <>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.focal_person_en}
                        oldValue={oldValue?.focal_person_en}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewFocalPersonEn}
                            value={newValue?.focal_person_en}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.focal_person_loc}
                        oldValue={oldValue?.focal_person_loc}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewFocalPersonLocal}
                            value={newValue?.focal_person_loc}
                        />
                    </DiffWrapper>
                </>
            )}
            {newValue?.type !== TYPE_HEALTH_CARE && (
                <>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.source_en}
                        oldValue={oldValue?.source_en}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewSourceEn}
                            value={newValue?.source_en}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.source_loc}
                        oldValue={oldValue?.source_loc}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewSourceLocal}
                            value={newValue?.source_loc}
                        />
                    </DiffWrapper>
                </>
            )}
            {newValue?.type === TYPE_HEALTH_CARE && (
                <>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.affiliation}
                        oldValue={oldValue?.health?.affiliation}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewAffiliation}
                            options={localUnitsOptions?.affiliation}
                            value={newValue?.health?.affiliation}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.other_affiliation}
                        oldValue={oldValue?.health?.other_affiliation}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewOtherAffiliation}
                            value={newValue?.health?.other_affiliation}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.functionality}
                        oldValue={oldValue?.health?.functionality}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewFunctionality}
                            options={localUnitsOptions?.functionality}
                            value={newValue?.health?.functionality}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.hospital_type}
                        oldValue={oldValue?.health?.hospital_type}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewHospitalType}
                            options={localUnitsOptions?.hospital_type}
                            value={newValue?.health?.hospital_type}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.is_teaching_hospital}
                        oldValue={
                            oldValue?.health?.is_teaching_hospital
                        }
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewTeachingHospital}
                            value={newValue?.health?.is_teaching_hospital}
                            valueType="boolean"
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.is_teaching_hospital}
                        oldValue={
                            oldValue?.health?.is_teaching_hospital
                        }
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewInPatientCapacity}
                            value={newValue?.health?.is_in_patient_capacity}
                            valueType="boolean"
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.is_teaching_hospital}
                        oldValue={
                            oldValue?.health?.is_teaching_hospital
                        }
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewIsolationRoomsWards}
                            value={newValue?.health?.is_isolation_rooms_wards}
                            valueType="boolean"
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.country}
                        oldValue={oldValue?.country}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewCountry}
                            options={countries}
                            value={newValue?.country}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                </>
            )}
            <DiffWrapper
                showOnlyDiff
                value={newValue?.address_en}
                oldValue={oldValue?.address_en}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewAddressEn}
                    value={newValue?.address_en}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.address_loc}
                oldValue={oldValue?.address_loc}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewAddressLocal}
                    value={newValue?.address_loc}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.city_en}
                oldValue={oldValue?.city_en}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLocalityEn}
                    value={newValue?.city_en}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.city_loc}
                oldValue={oldValue?.city_loc}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewLocalityLocal}
                    value={newValue?.city_loc}
                />
            </DiffWrapper>
            <DiffWrapper
                showOnlyDiff
                value={newValue?.postcode}
                oldValue={oldValue?.postcode}
                enabled
            >
                <TextOutput
                    strongLabel
                    label={strings.localUnitViewPostCode}
                    value={newValue?.postcode}
                />
            </DiffWrapper>
            {newValue?.type !== TYPE_HEALTH_CARE && (
                <>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.phone}
                        oldValue={oldValue?.phone}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewPhone}
                            value={newValue?.phone}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.email}
                        oldValue={oldValue?.email}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewEmail}
                            value={newValue?.email}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.link}
                        oldValue={oldValue?.link}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewWebsite}
                            value={newValue?.link}
                        />
                    </DiffWrapper>
                </>
            )}
            {newValue?.type === TYPE_HEALTH_CARE && (
                <>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.health_facility_type}
                        oldValue={oldValue?.health?.health_facility_type}
                        enabled
                    >
                        <SelectOutput
                            label={strings.localUnitViewHealthFacilityType}
                            options={localUnitsOptions?.health_facility_type}
                            value={newValue?.health?.health_facility_type}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.general_medical_services}
                        oldValue={oldValue?.health?.general_medical_services}
                        enabled
                    >
                        <MultiSelectOutput
                            label={strings.localUnitViewGeneralMedicalServices}
                            options={localUnitsOptions?.general_medical_services}
                            value={newValue?.health?.general_medical_services}
                            keySelector={numericIdSelector}
                            labelSelector={stringNameSelector}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.focal_point_position}
                        oldValue={oldValue?.health?.focal_point_position}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewFocalPointPosition}
                            value={newValue?.health?.focal_point_position}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.focal_point_email}
                        oldValue={oldValue?.health?.focal_point_email}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewFocalPointEmail}
                            value={newValue?.health?.focal_point_email}
                        />
                    </DiffWrapper>
                    <DiffWrapper
                        showOnlyDiff
                        value={newValue?.health?.focal_point_phone_number}
                        oldValue={oldValue?.health?.focal_point_phone_number}
                        enabled
                    >
                        <TextOutput
                            strongLabel
                            label={strings.localUnitViewFocalPointPhoneNumber}
                            value={newValue?.health?.focal_point_phone_number}
                        />
                    </DiffWrapper>
                </>
            )}
        </Container>
    );
}

export default LocalUnitView;
