import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    lengthSmallerThanCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
    urlCondition,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import {
    AMBULANCE_TYPE,
    HOSPITAL_TYPE,
    OTHER_AFFILIATION,
    OTHER_TRAINING_FACILITIES,
    OTHER_TYPE,
    PRIMARY_HEALTH_TYPE,
    RESIDENTIAL_TYPE,
    SPECIALIZED_SERVICES_TYPE,
    TRAINING_FACILITY_TYPE,
} from '#utils/constants';
import {
    getNumberInBetweenCondition,
    positiveIntegerCondition,
} from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

type TypeOfLocalUnits = components<'read'>['schemas']['LocalUnitType']['code'];

export const TYPE_HEALTH_CARE = 2 satisfies TypeOfLocalUnits;

type LocalUnitsRequestBody = GoApiBody<'/api/v2/local-units/{id}/', 'PATCH'>;
export type LocalUnitsRequestPostBody = GoApiBody<'/api/v2/local-units/', 'POST'>;

type OtherProfilesResponse = NonNullable<NonNullable<LocalUnitsRequestBody['health']>['other_profiles']>[number];
type OtherProfilesFormFields = OtherProfilesResponse & { client_id: string; };

type HealthRequestFields = NonNullable<LocalUnitsRequestBody['health']>;

type HealthFields = Omit<HealthRequestFields, 'other_profiles'> & {
    other_profiles: OtherProfilesFormFields[];
};

type LocalUnitsFormFields = Omit<LocalUnitsRequestBody, 'health'> & {
    health: HealthFields;
};

export type PartialLocalUnits = PartialForm<
    LocalUnitsFormFields,
    'client_id'
>;

type LocalUnitsFormSchema = ObjectSchema<PartialLocalUnits>;
type LocalUnitsFormSchemaFields = ReturnType<LocalUnitsFormSchema['fields']>

type PartialHealth = NonNullable<PartialLocalUnits['health']>
type LocalUnitsHealthFormSchema = ObjectSchema<PartialHealth>;
type LocalUnitsHealthFormSchemaFields = ReturnType<LocalUnitsHealthFormSchema['fields']>;

type OtherProfileFormSchema = ObjectSchema<PartialForm<OtherProfilesFormFields, 'client_id'>, PartialLocalUnits>;
type OtherProfileFormSchemaFields = ReturnType<OtherProfileFormSchema['fields']>;

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
                requiredValidation: requiredStringCondition,
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
                            // getNumberInBetweenCondition(-180, 180),
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
                            fields: (): LocalUnitsHealthFormSchemaFields => {
                                let healthFields: LocalUnitsHealthFormSchemaFields = {
                                    affiliation: { required: true },
                                    other_affiliation: {
                                        validations: [lengthSmallerThanCondition(500)],
                                    },
                                    functionality: { required: true },
                                    health_facility_type: { required: true },
                                    other_facility_type: {
                                        validations: [lengthSmallerThanCondition(200)],
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
                                        required: true,
                                        validations: [lengthSmallerThanCondition(50)],
                                    },
                                    focal_point_phone_number: {
                                        validations: [
                                            lengthSmallerThanCondition(50),
                                        ],
                                    },
                                    hospital_type: {},
                                    specialized_medical_beyond_primary_level: { required: true },
                                    primary_health_care_center: {},
                                    other_services: {
                                        validations: [lengthSmallerThanCondition(200)],
                                    },
                                    blood_services: { required: true },
                                    professional_training_facilities: { defaultValue: [] },
                                    other_training_facilities: {},
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
                                    pharmacists: {
                                        validations: [
                                            positiveIntegerCondition,
                                        ],
                                    },
                                    other_medical_heal: {},
                                    other_profiles: {
                                        keySelector: (item) => item.client_id,
                                        member: () => ({
                                            fields: (): OtherProfileFormSchemaFields => ({
                                                client_id: {},
                                                id: { defaultValue: undefinedValue },
                                                number: { required: true },
                                                position: { required: true },
                                            }),
                                        }),
                                    },
                                    feedback: {
                                        validations: [lengthSmallerThanCondition(500)],
                                    },
                                };

                                if (isNotDefined(formValue?.health)) {
                                    return healthFields;
                                }

                                healthFields = addCondition(
                                    healthFields,
                                    formValue?.health,
                                    ['affiliation'],
                                    ['other_affiliation'],
                                    (healthValue) => {
                                        if (healthValue.affiliation === OTHER_AFFILIATION) {
                                            return {
                                                other_affiliation: {
                                                    required: true,
                                                    validations: [lengthSmallerThanCondition(500)],
                                                },
                                            };
                                        }

                                        return {
                                            other_affiliation: { forceValue: nullValue },
                                        };
                                    },
                                );

                                healthFields = addCondition(
                                    healthFields,
                                    formValue.health,
                                    ['health_facility_type'],
                                    [
                                        'primary_health_care_center',
                                        'hospital_type',
                                        'speciality',
                                        'professional_training_facilities',
                                        'ambulance_type_a',
                                        'ambulance_type_b',
                                        'ambulance_type_c',
                                        'other_facility_type',
                                        'is_teaching_hospital',
                                        'is_in_patient_capacity',
                                        'is_isolation_rooms_wards',
                                    ],
                                    (healthValue) => {
                                        if (healthValue.health_facility_type === HOSPITAL_TYPE) {
                                            return {
                                                hospital_type: { required: true },
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                speciality: { forceValue: nullValue },
                                                ambulance_type_a: { forceValue: nullValue },
                                                ambulance_type_b: { forceValue: nullValue },
                                                ambulance_type_c: { forceValue: nullValue },
                                                other_facility_type: { forceValue: nullValue },
                                                professional_training_facilities: {
                                                    forceValue: [],
                                                },
                                                is_teaching_hospital: { required: true },
                                                is_in_patient_capacity: { required: true },
                                                is_isolation_rooms_wards: { required: true },
                                            };
                                        }

                                        if (
                                            healthValue.health_facility_type === PRIMARY_HEALTH_TYPE
                                        ) {
                                            return {
                                                primary_health_care_center: { required: true },
                                                hospital_type: { forceValue: nullValue },
                                                speciality: { forceValue: nullValue },
                                                ambulance_type_a: { forceValue: nullValue },
                                                ambulance_type_b: { forceValue: nullValue },
                                                ambulance_type_c: { forceValue: nullValue },
                                                other_facility_type: { forceValue: nullValue },
                                                professional_training_facilities: {
                                                    forceValue: [],
                                                },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { required: true },
                                                is_isolation_rooms_wards: { required: true },
                                            };
                                        }

                                        if (
                                            healthValue
                                                .health_facility_type === SPECIALIZED_SERVICES_TYPE
                                        ) {
                                            return {
                                                speciality: {
                                                    required: true,
                                                    validations: [lengthSmallerThanCondition(200)],
                                                },
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                hospital_type: { forceValue: nullValue },
                                                ambulance_type_a: { forceValue: nullValue },
                                                ambulance_type_b: { forceValue: nullValue },
                                                ambulance_type_c: { forceValue: nullValue },
                                                other_facility_type: { forceValue: nullValue },
                                                professional_training_facilities: {
                                                    forceValue: [],
                                                },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { required: true },
                                                is_isolation_rooms_wards: { required: true },
                                            };
                                        }

                                        if (
                                            healthValue
                                                .health_facility_type === TRAINING_FACILITY_TYPE
                                        ) {
                                            return {
                                                professional_training_facilities: {
                                                    required: true,
                                                    defaultValue: [],
                                                },
                                                hospital_type: { forceValue: nullValue },
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                speciality: { forceValue: nullValue },
                                                ambulance_type_a: {},
                                                ambulance_type_b: {},
                                                ambulance_type_c: {},
                                                other_facility_type: { forceValue: nullValue },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { forceValue: nullValue },
                                                is_isolation_rooms_wards: { forceValue: nullValue },
                                            };
                                        }

                                        if (healthValue.health_facility_type === AMBULANCE_TYPE) {
                                            return {
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
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                speciality: { forceValue: nullValue },
                                                hospital_type: { forceValue: nullValue },
                                                other_facility_type: { forceValue: nullValue },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { forceValue: nullValue },
                                                is_isolation_rooms_wards: { forceValue: nullValue },
                                            };
                                        }

                                        if (healthValue.health_facility_type === OTHER_TYPE) {
                                            return {
                                                other_facility_type: {
                                                    required: true,
                                                    validations: [lengthSmallerThanCondition(200)],
                                                },
                                                hospital_type: { forceValue: nullValue },
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                speciality: { forceValue: nullValue },
                                                ambulance_type_a: {},
                                                ambulance_type_b: {},
                                                ambulance_type_c: {},
                                                professional_training_facilities: {
                                                    forceValue: [],
                                                },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { required: true },
                                                is_isolation_rooms_wards: { required: true },
                                            };
                                        }

                                        if (healthValue.health_facility_type === RESIDENTIAL_TYPE) {
                                            return {
                                                hospital_type: { forceValue: nullValue },
                                                primary_health_care_center: {
                                                    forceValue: nullValue,
                                                },
                                                speciality: { forceValue: nullValue },
                                                ambulance_type_a: {},
                                                ambulance_type_b: {},
                                                ambulance_type_c: {},
                                                other_facility_type: { forceValue: nullValue },
                                                professional_training_facilities: {
                                                    forceValue: [],
                                                },
                                                is_teaching_hospital: { forceValue: nullValue },
                                                is_in_patient_capacity: { required: true },
                                                is_isolation_rooms_wards: { required: true },
                                            };
                                        }

                                        return {
                                            hospital_type: { forceValue: nullValue },
                                            primary_health_care_center: {
                                                forceValue: nullValue,
                                            },
                                            speciality: { forceValue: nullValue },
                                            ambulance_type_a: {},
                                            ambulance_type_b: {},
                                            ambulance_type_c: {},
                                            other_facility_type: { forceValue: nullValue },
                                            professional_training_facilities: {
                                                forceValue: [],
                                            },
                                            is_teaching_hospital: { forceValue: nullValue },
                                            is_in_patient_capacity: { forceValue: nullValue },
                                            is_isolation_rooms_wards: { forceValue: nullValue },
                                        };
                                    },
                                );

                                healthFields = addCondition(
                                    healthFields,
                                    formValue.health,
                                    ['health_facility_type', 'professional_training_facilities'],
                                    ['other_training_facilities'],
                                    (healthValue) => {
                                        if (healthValue
                                            .health_facility_type === TRAINING_FACILITY_TYPE
                                            && healthValue.professional_training_facilities
                                                ?.includes(OTHER_TRAINING_FACILITIES)
                                        ) {
                                            return {
                                                other_training_facilities: {
                                                    required: true,
                                                },
                                            };
                                        }

                                        return {
                                            other_training_facilities: {
                                                forceValue: nullValue,
                                            },
                                        };
                                    },
                                );

                                healthFields = addCondition(
                                    healthFields,
                                    formValue.health,
                                    ['health_facility_type', 'is_in_patient_capacity'],
                                    ['maximum_capacity'],
                                    (healthValue) => {
                                        if ((healthValue.health_facility_type === HOSPITAL_TYPE
                                            // eslint-disable-next-line max-len
                                            || healthValue.health_facility_type === PRIMARY_HEALTH_TYPE
                                            // eslint-disable-next-line max-len
                                            || healthValue.health_facility_type === SPECIALIZED_SERVICES_TYPE
                                            || healthValue.health_facility_type === OTHER_TYPE
                                            || healthValue.health_facility_type === RESIDENTIAL_TYPE
                                        ) && healthValue.is_in_patient_capacity === true) {
                                            return {
                                                maximum_capacity: {
                                                    required: true,
                                                    validations: [
                                                        positiveIntegerCondition,
                                                    ],
                                                },
                                            };
                                        }

                                        return {
                                            maximum_capacity: { forceValue: nullValue },
                                        };
                                    },
                                );

                                healthFields = addCondition(
                                    healthFields,
                                    formValue.health,
                                    ['health_facility_type', 'is_isolation_rooms_wards'],
                                    ['number_of_isolation_rooms'],
                                    (healthValue) => {
                                        if ((healthValue.health_facility_type === HOSPITAL_TYPE
                                            // eslint-disable-next-line max-len
                                            || healthValue.health_facility_type === PRIMARY_HEALTH_TYPE
                                            // eslint-disable-next-line max-len
                                            || healthValue.health_facility_type === SPECIALIZED_SERVICES_TYPE
                                            || healthValue.health_facility_type === OTHER_TYPE
                                            || healthValue.health_facility_type === RESIDENTIAL_TYPE
                                        ) && healthValue.is_isolation_rooms_wards === true) {
                                            return {
                                                number_of_isolation_rooms: {
                                                    required: true,
                                                    validations: [
                                                        positiveIntegerCondition,
                                                    ],
                                                },
                                            };
                                        }

                                        return {
                                            number_of_isolation_rooms: { forceValue: nullValue },
                                        };
                                    },
                                );

                                return healthFields;
                            },
                        },
                    };
                }

                return {
                    focal_person_loc: {
                        requiredValidation: requiredStringCondition,
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
