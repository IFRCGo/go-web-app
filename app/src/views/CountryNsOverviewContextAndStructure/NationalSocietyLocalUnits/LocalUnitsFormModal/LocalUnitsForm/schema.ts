import {
    addCondition,
    emailCondition,
    lengthSmallerThanCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    urlCondition,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import {
    getNumberInBetweenCondition,
    positiveIntegerCondition,
} from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

type LocalUnitsRequestBody = GoApiBody<'/api/v2/local-units/{id}/', 'PATCH'> & {
    location_json: {
        lng: number;
        lat: number;
    }
};
export type LocalUnitsRequestPostBody = GoApiBody<'/api/v2/local-units/', 'POST'> & {
    location_json: {
        lng: number;
        lat: number;
    }
};

export type LocalUnitsRevertRequestPostBody = GoApiBody<'/api/v2/local-units/{id}/revert/', 'POST'>;
type TypeOfLocalUnits = components<'read'>['schemas']['LocalUnitType']['code'];

export type PartialLocalUnits = PartialForm<
    PurgeNull<LocalUnitsRequestBody>,
    'client_id'
>;

// const TYPE_ADMINISTRATIVE = 1 satisfies TypeOfLocalUnits;
export const TYPE_HEALTH_CARE = 2 satisfies TypeOfLocalUnits;
// const TYPE_EMERGENCY_RESPONSE = 3 satisfies TypeOfLocalUnits;
// const TYPE_HUMANITARIAN_ASSISTANCE_CENTERS = 4 satisfies TypeOfLocalUnits;
// const TYPE_TRAINING_AND_EDUCATION = 5 satisfies TypeOfLocalUnits;
// const TYPE_OTHER = 6 satisfies TypeOfLocalUnits;

export type PartialLocalUnitsRevertForm = PartialForm<LocalUnitsRevertRequestPostBody>;
type LocalUnitsRevertFormSchema = ObjectSchema<PartialLocalUnitsRevertForm>;
type LocalUnitRevertSchemaFields = ReturnType<LocalUnitsRevertFormSchema['fields']>;

export const revertSchema: LocalUnitsRevertFormSchema = {
    fields: (): LocalUnitRevertSchemaFields => ({
        reason: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

type LocalUnitsFormSchema = ObjectSchema<PartialLocalUnits>;
type LocalUnitsFormSchemaFields = ReturnType<LocalUnitsFormSchema['fields']>;
type LocalUnitsHealthFormSchema = ObjectSchema<NonNullable<PartialLocalUnits['health']>>;
type LocalUnitsHealthFormSchemaFields = ReturnType<LocalUnitsHealthFormSchema['fields']>;

const schema: LocalUnitsFormSchema = {
    fields: (formValue): LocalUnitsFormSchemaFields => {
        let formFields: LocalUnitsFormSchemaFields = {
            type: { required: true },
            visibility: { required: true },
            country: { required: true },
            subtype: {
                validations: [lengthSmallerThanCondition(200)],
            },
            local_branch_name: {
                required: true,
                validations: [lengthSmallerThanCondition(200)],
            },
            english_branch_name: {
                validations: [lengthSmallerThanCondition(200)],
            },
            level: {},
            focal_person_en: {
                validations: [lengthSmallerThanCondition(200)],
            },
            date_of_data: { required: true },
            source_loc: {},
            source_en: {},
            address_en: {
                validations: [lengthSmallerThanCondition(200)],
            },
            address_loc: {
                validations: [lengthSmallerThanCondition(200)],
            },
            postcode: {
                validations: [lengthSmallerThanCondition(20)],
            },
            phone: {
                validations: [lengthSmallerThanCondition(100)],
            },
            email: {
                validations: [emailCondition],
            },
            city_en: {
                validations: [lengthSmallerThanCondition(100)],
            },
            city_loc: {
                validations: [lengthSmallerThanCondition(100)],
            },
            link: {
                validations: [urlCondition],
            },
            location_json: {
                fields: () => ({
                    lng: {
                        required: true,
                        validations: [
                            getNumberInBetweenCondition(-180, 180),
                        ],
                    },
                    lat: {
                        required: true,
                        validations: [
                            getNumberInBetweenCondition(-90, 90),
                        ],
                    },
                }),
            },
        };

        formFields = addCondition(
            formFields,
            formValue,
            ['type'],
            ['health', 'focal_person_loc'],
            (val) => {
                if (val?.type === TYPE_HEALTH_CARE) {
                    return {
                        focal_person_loc: { forceValue: nullValue },
                        health: {
                            fields: (): LocalUnitsHealthFormSchemaFields => ({
                                affiliation: { required: true },
                                functionality: { required: true },
                                health_facility_type: { required: true },
                                other_facility_type: {
                                    validations: [lengthSmallerThanCondition(200)],
                                },
                                other_affiliation: {
                                    validations: [lengthSmallerThanCondition(500)],
                                },
                                is_teaching_hospital: { required: true },
                                is_in_patient_capacity: { required: true },
                                is_isolation_rooms_wards: { required: true },
                                focal_point_email: {
                                    required: true,
                                    validations: [
                                        lengthSmallerThanCondition(50),
                                        emailCondition,
                                    ],
                                },
                                focal_point_position: {
                                    validations: [lengthSmallerThanCondition(50)],
                                },
                                focal_point_phone_number: {
                                    validations: [lengthSmallerThanCondition(50)],
                                },
                                hospital_type: {},
                                specialized_medical_beyond_primary_level: { required: true },
                                primary_health_care_center: {},
                                other_services: {
                                    validations: [lengthSmallerThanCondition(200)],
                                },
                                blood_services: { required: true },
                                professional_training_facilities: { defaultValue: [] },
                                general_medical_services: { required: true },
                                speciality: {
                                    validations: [lengthSmallerThanCondition(200)],
                                },
                                maximum_capacity: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                number_of_isolation_rooms: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                is_warehousing: {},
                                is_cold_chain: {},
                                ambulance_type_a: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                ambulance_type_b: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                ambulance_type_c: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                total_number_of_human_resource: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                    required: true,
                                },
                                general_practitioner: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                specialist: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                residents_doctor: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                nurse: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                dentist: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                nursing_aid: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                midwife: {
                                    validations: [
                                        positiveIntegerCondition,
                                    ],
                                },
                                other_medical_heal: {},
                                other_profiles: {
                                    validations: [lengthSmallerThanCondition(200)],
                                },
                                feedback: {
                                    validations: [lengthSmallerThanCondition(500)],
                                },
                            }),
                        },
                    };
                }
                return {
                    focal_person_loc: {
                        validations: [lengthSmallerThanCondition(200)],
                        required: true,
                    },
                    health: { forceValue: nullValue },
                };
            },
        );

        return formFields;
    },
};

export default schema;
