import {
    addCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import {
    type GoApiBody,
    type GoApiResponse,
} from '#utils/restRequest';

export type LocalUnitsResponse = GoApiResponse<'/api/v2/local-units/'>;
export type LocalUnitsRequestBody = GoApiBody<'/api/v2/local-units/{id}/', 'PATCH'>;
export type LocalUnitsRequestPostBody = GoApiBody<'/api/v2/local-units/', 'POST'>;
export type TypeOfLocalUnits = components<'read'>['schemas']['LocalUnitType']['code'];

export type PartialLocalUnits = PartialForm<
    PurgeNull<LocalUnitsRequestBody>,
    'client_id'
>;

export const TYPE_ADMINISTRATIVE = 1 satisfies TypeOfLocalUnits;
export const TYPE_HEALTH_CARE = 2 satisfies TypeOfLocalUnits;
export const TYPE_EMERGENCY_RESPONSE = 3 satisfies TypeOfLocalUnits;
export const TYPE_HUMANITARIAN_ASSISTANCE_CENTERS = 4 satisfies TypeOfLocalUnits;
export const TYPE_TRAINING_AND_EDUCATION = 5 satisfies TypeOfLocalUnits;
export const TYPE_OTHER = 6 satisfies TypeOfLocalUnits;

type LocalUnitsFormSchema = ObjectSchema<PartialLocalUnits>;
type LocalUnitsFormSchemaFields = ReturnType<LocalUnitsFormSchema['fields']>;
type LocalUnitsHealthFormSchema = ObjectSchema<NonNullable<PartialLocalUnits['health']>>;
type LocalUnitsHealthFormSchemaFields = ReturnType<LocalUnitsHealthFormSchema['fields']>;

const schema: LocalUnitsFormSchema = {
    fields: (formValue): LocalUnitsFormSchemaFields => {
        let formFields: LocalUnitsFormSchemaFields = {
            type: { required: true },
            location: {},
            subtype: {},
            local_branch_name: {},
            english_branch_name: {},
            level: {},
            focal_person_en: {},
            focal_person_loc: {},
            source_en: {},
            address_en: {},
            address_loc: {},
            postcode: {},
            phone: {},
            email: {},
            city_en: {},
            city_loc: {},
            link: {},
        };

        formFields = addCondition(
            formFields,
            formValue,
            ['type'],
            ['health'],
            (val) => {
                if (val?.type === TYPE_HEALTH_CARE) {
                    return {
                        health: {
                            fields: (): LocalUnitsHealthFormSchemaFields => ({
                                affiliation: { required: true },
                                functionality: { required: true },
                                health_facility_type: { required: true },
                                other_facility_type: {},
                                other_affiliation: { required: true },
                                is_teaching_hospital: {},
                                is_in_patient_capacity: {},
                                is_isolation_rooms_wards: {},
                                // address
                                focal_point_email: {},
                                focal_point_position: {},
                                focal_point_phone_number: {},
                                // Specialities and capacity
                                // ??
                                specialized_medical_beyond_primary_level: {},
                                // ??
                                other_services: {},
                                blood_services: {},
                                professional_training_facilities: {},
                                general_medical_services: {},
                                speciality: {},
                                maximum_capacity: {},
                                number_of_isolation_rooms: {},
                                is_warehousing: {},
                                is_cold_chain: {},
                                ambulance_type_a: {},
                                ambulance_type_b: {},
                                ambulance_type_c: {},
                                // Human resources
                                total_number_of_human_resource: {},
                                general_practitioner: {},
                                specialist: {},
                                residents_doctor: {},
                                nurse: {},
                                dentist: {},
                                nursing_aid: {},
                                midwife: {},
                                other_medical_heal: {},
                                other_profiles: {},
                                feedback: {},
                            }),
                        },
                    };
                }
                return {
                    health: { forceValue: nullValue },
                };
            },
        );

        return formFields;
    },
};

export default schema;
