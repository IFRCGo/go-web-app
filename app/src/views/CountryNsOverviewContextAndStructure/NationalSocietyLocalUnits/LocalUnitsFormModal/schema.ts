import { isNotDefined } from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    lengthSmallerThanCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    urlCondition,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import { getNumberInBetweenCondition } from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

import healthSchema, { type PartialHealthFields } from './HealthFields/schema';

type LocalUnitTypeCode = components<'read'>['schemas']['LocalUnitType']['code'];
export const TYPE_HEALTH_CARE = 2 satisfies LocalUnitTypeCode;

type LocalUnitsRequestBody = GoApiBody<'/api/v2/local-units/{id}/', 'PUT'>;

type LocalUnitsFormFields = Omit<LocalUnitsRequestBody, 'health'> & {
    health: PartialHealthFields;
};

export type PartialLocalUnits = PartialForm<
    LocalUnitsFormFields,
    'client_id'
>;

type LocalUnitsFormSchema = ObjectSchema<PartialLocalUnits>;
type LocalUnitsFormSchemaFields = ReturnType<LocalUnitsFormSchema['fields']>

const schema: LocalUnitsFormSchema = {
    fields: (value): LocalUnitsFormSchemaFields => {
        const baseFields = {
            type: { required: true },
            visibility: { required: true },
            country: { required: true },
            subtype: { validations: [lengthSmallerThanCondition(200)] },
            local_branch_name: {
                required: true,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerThanCondition(200)],
            },
            english_branch_name: { validations: [lengthSmallerThanCondition(200)] },
            level: {},
            focal_person_en: { validations: [lengthSmallerThanCondition(200)] },
            date_of_data: { required: true },
            source_loc: {},
            source_en: {},
            address_en: { validations: [lengthSmallerThanCondition(200)] },
            address_loc: { validations: [lengthSmallerThanCondition(200)] },
            postcode: { validations: [lengthSmallerThanCondition(20)] },
            phone: { validations: [lengthSmallerThanCondition(100)] },
            email: { validations: [emailCondition] },
            city_en: { validations: [lengthSmallerThanCondition(100)] },
            city_loc: { validations: [lengthSmallerThanCondition(100)] },
            link: { validations: [urlCondition] },
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
            health: {},
        } satisfies LocalUnitsFormSchemaFields;

        if (isNotDefined(value)) {
            return baseFields;
        }

        const conditionalFields = addCondition(
            baseFields,
            value,
            ['type'],
            ['health', 'focal_person_loc'],
            ({ type }) => {
                if (type === TYPE_HEALTH_CARE) {
                    return {
                        focal_person_loc: { forceValue: nullValue },
                        health: healthSchema,
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

        return conditionalFields;
    },
};

export default schema;
