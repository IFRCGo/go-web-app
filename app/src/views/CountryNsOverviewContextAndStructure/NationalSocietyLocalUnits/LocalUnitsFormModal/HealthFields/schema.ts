import { type DeepReplace } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    lengthSmallerThanCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
} from '@togglecorp/toggle-form';

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
import { positiveIntegerCondition } from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

import otherProfileSchema, { type PartialOtherProfileFields } from './HealthOtherProfileInput/schema';

type LocalUnitsRequestBody = GoApiBody<'/api/v2/local-units/{id}/', 'PATCH'>;
type HealthRequestBody = NonNullable<LocalUnitsRequestBody['health']>;
type OtherProfileRequestBody = NonNullable<NonNullable<HealthRequestBody>['other_profiles']>[number];

type HealthFields = DeepReplace<
    HealthRequestBody,
    OtherProfileRequestBody,
    PartialOtherProfileFields
>

export type PartialHealthFields = PartialForm<HealthFields, 'client_id'>;

type HealthFormSchema = ObjectSchema<PartialHealthFields>;
type HealthFormSchemaFields = ReturnType<HealthFormSchema['fields']>;

const healthSchema: HealthFormSchema = {
    fields: (value): HealthFormSchemaFields => {
        const baseFields = {
            affiliation: { required: true },
            other_affiliation: {},
            functionality: { required: true },
            health_facility_type: { required: true },
            other_facility_type: {},
            is_teaching_hospital: {},
            is_in_patient_capacity: {},
            is_isolation_rooms_wards: {},
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
            other_services: { validations: [lengthSmallerThanCondition(200)] },
            blood_services: { required: true },
            professional_training_facilities: {},
            other_training_facilities: {},
            general_medical_services: { required: true },
            speciality: {},
            maximum_capacity: {},
            number_of_isolation_rooms: {},
            is_warehousing: {},
            is_cold_chain: {},
            ambulance_type_a: {},
            ambulance_type_b: {},
            ambulance_type_c: {},
            total_number_of_human_resource: { validations: [positiveIntegerCondition] },
            general_practitioner: { validations: [positiveIntegerCondition] },
            specialist: { validations: [positiveIntegerCondition] },
            residents_doctor: { validations: [positiveIntegerCondition] },
            nurse: { validations: [positiveIntegerCondition] },
            dentist: { validations: [positiveIntegerCondition] },
            nursing_aid: { validations: [positiveIntegerCondition] },
            midwife: { validations: [positiveIntegerCondition] },
            pharmacists: { validations: [positiveIntegerCondition] },
            other_medical_heal: {},
            other_profiles: {
                keySelector: (item) => item.client_id,
                member: () => otherProfileSchema,
            },
            feedback: { validations: [lengthSmallerThanCondition(500)] },
        } satisfies HealthFormSchemaFields;

        if (isNotDefined(value)) {
            return baseFields;
        }

        let conditionalFields = addCondition(
            baseFields,
            value,
            ['affiliation'],
            ['other_affiliation'],
            ({ affiliation }) => {
                if (affiliation === OTHER_AFFILIATION) {
                    return {
                        other_affiliation: {
                            required: true,
                            validations: [lengthSmallerThanCondition(500)],
                        },
                    };
                }

                return {
                    other_affiliation: {
                        forceValue: nullValue,
                    },
                };
            },
        );

        conditionalFields = addCondition(
            conditionalFields,
            value,
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
            ({ health_facility_type }) => {
                if (health_facility_type === HOSPITAL_TYPE) {
                    return {
                        hospital_type: { required: true },
                        is_teaching_hospital: { required: true },
                        is_in_patient_capacity: { required: true },
                        is_isolation_rooms_wards: { required: true },

                        primary_health_care_center: { forceValue: nullValue },
                        speciality: { forceValue: nullValue },
                        ambulance_type_a: { forceValue: nullValue },
                        ambulance_type_b: { forceValue: nullValue },
                        ambulance_type_c: { forceValue: nullValue },
                        other_facility_type: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                    };
                }

                if (health_facility_type === PRIMARY_HEALTH_TYPE) {
                    return {
                        primary_health_care_center: { required: true },
                        is_in_patient_capacity: { required: true },
                        is_isolation_rooms_wards: { required: true },

                        hospital_type: { forceValue: nullValue },
                        speciality: { forceValue: nullValue },
                        ambulance_type_a: { forceValue: nullValue },
                        ambulance_type_b: { forceValue: nullValue },
                        ambulance_type_c: { forceValue: nullValue },
                        other_facility_type: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                        is_teaching_hospital: { forceValue: nullValue },
                    };
                }

                if (health_facility_type === SPECIALIZED_SERVICES_TYPE) {
                    return {
                        speciality: {
                            required: true,
                            validations: [lengthSmallerThanCondition(200)],
                        },
                        is_in_patient_capacity: { required: true },
                        is_isolation_rooms_wards: { required: true },

                        primary_health_care_center: { forceValue: nullValue },
                        hospital_type: { forceValue: nullValue },
                        ambulance_type_a: { forceValue: nullValue },
                        ambulance_type_b: { forceValue: nullValue },
                        ambulance_type_c: { forceValue: nullValue },
                        other_facility_type: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                        is_teaching_hospital: { forceValue: nullValue },
                    };
                }

                if (health_facility_type === TRAINING_FACILITY_TYPE) {
                    return {
                        professional_training_facilities: {
                            required: true,
                            defaultValue: [],
                        },
                        hospital_type: { forceValue: nullValue },
                        primary_health_care_center: { forceValue: nullValue },
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

                if (health_facility_type === AMBULANCE_TYPE) {
                    return {
                        ambulance_type_a: { validations: [positiveIntegerCondition] },
                        ambulance_type_b: { validations: [positiveIntegerCondition] },
                        ambulance_type_c: { validations: [positiveIntegerCondition] },

                        primary_health_care_center: { forceValue: nullValue },
                        speciality: { forceValue: nullValue },
                        hospital_type: { forceValue: nullValue },
                        other_facility_type: { forceValue: nullValue },
                        is_teaching_hospital: { forceValue: nullValue },
                        is_in_patient_capacity: { forceValue: nullValue },
                        is_isolation_rooms_wards: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                    };
                }

                if (health_facility_type === OTHER_TYPE) {
                    return {
                        other_facility_type: {
                            required: true,
                            validations: [lengthSmallerThanCondition(200)],
                        },
                        is_in_patient_capacity: { required: true },
                        is_isolation_rooms_wards: { required: true },
                        ambulance_type_a: {},
                        ambulance_type_b: {},
                        ambulance_type_c: {},

                        hospital_type: { forceValue: nullValue },
                        primary_health_care_center: { forceValue: nullValue },
                        speciality: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                        is_teaching_hospital: { forceValue: nullValue },
                    };
                }

                if (health_facility_type === RESIDENTIAL_TYPE) {
                    return {
                        is_in_patient_capacity: { required: true },
                        is_isolation_rooms_wards: { required: true },
                        ambulance_type_a: {},
                        ambulance_type_b: {},
                        ambulance_type_c: {},

                        hospital_type: { forceValue: nullValue },
                        primary_health_care_center: { forceValue: nullValue },
                        speciality: { forceValue: nullValue },
                        other_facility_type: { forceValue: nullValue },
                        professional_training_facilities: { forceValue: [] },
                        is_teaching_hospital: { forceValue: nullValue },
                    };
                }

                return {
                    hospital_type: { forceValue: nullValue },
                    primary_health_care_center: { forceValue: nullValue },
                    speciality: { forceValue: nullValue },
                    ambulance_type_a: {},
                    ambulance_type_b: {},
                    ambulance_type_c: {},
                    other_facility_type: { forceValue: nullValue },
                    professional_training_facilities: { forceValue: [] },
                    is_teaching_hospital: { forceValue: nullValue },
                    is_in_patient_capacity: { forceValue: nullValue },
                    is_isolation_rooms_wards: { forceValue: nullValue },
                };
            },
        );

        conditionalFields = addCondition(
            conditionalFields,
            value,
            ['health_facility_type', 'professional_training_facilities'],
            ['other_training_facilities'],
            ({ health_facility_type, professional_training_facilities }) => {
                if (health_facility_type === TRAINING_FACILITY_TYPE
                    && professional_training_facilities?.includes(OTHER_TRAINING_FACILITIES)
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

        conditionalFields = addCondition(
            conditionalFields,
            value,
            ['health_facility_type', 'is_in_patient_capacity'],
            ['maximum_capacity'],
            ({ health_facility_type, is_in_patient_capacity }) => {
                if ((health_facility_type === HOSPITAL_TYPE
                    || health_facility_type === PRIMARY_HEALTH_TYPE
                    || health_facility_type === SPECIALIZED_SERVICES_TYPE
                    || health_facility_type === OTHER_TYPE
                    || health_facility_type === RESIDENTIAL_TYPE
                ) && is_in_patient_capacity === true) {
                    return {
                        maximum_capacity: {
                            required: true,
                            validations: [positiveIntegerCondition],
                        },
                    };
                }

                return {
                    maximum_capacity: { forceValue: nullValue },
                };
            },
        );

        conditionalFields = addCondition(
            conditionalFields,
            value,
            ['health_facility_type', 'is_isolation_rooms_wards'],
            ['number_of_isolation_rooms'],
            ({ health_facility_type, is_isolation_rooms_wards }) => {
                if ((health_facility_type === HOSPITAL_TYPE
                    || health_facility_type === PRIMARY_HEALTH_TYPE
                    || health_facility_type === SPECIALIZED_SERVICES_TYPE
                    || health_facility_type === OTHER_TYPE
                    || health_facility_type === RESIDENTIAL_TYPE
                ) && is_isolation_rooms_wards === true) {
                    return {
                        number_of_isolation_rooms: {
                            required: true,
                            validations: [positiveIntegerCondition],
                        },
                    };
                }

                return {
                    number_of_isolation_rooms: { forceValue: nullValue },
                };
            },
        );

        return conditionalFields;
    },
};

export default healthSchema;
