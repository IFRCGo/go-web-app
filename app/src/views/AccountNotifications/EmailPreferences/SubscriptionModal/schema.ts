import { isDefined } from '@togglecorp/fujs';
import {
    nullValue,
    type ObjectSchema,
    type PurgeNull,
    requiredListCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type SubscriptionRequestBody = GoApiBody<'/api/v2/alert-subscription/{id}/', 'PATCH'>;

type FormFields = PurgeNull<SubscriptionRequestBody>;
export type PartialFormFields = Partial<FormFields>;

type FormSchema = ObjectSchema<PartialFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const formSchema: FormSchema = {
    fields: (formValue): FormSchemaFields => ({
        alert_per_day: {
            defaultValue: nullValue,
        },
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        hazard_types: {
            required: true,
            requiredValidation: requiredListCondition,
        },
        countries: {
            defaultValue: [],
        },
        regions: {
            keySelector: (region) => region,
            member: () => ({ }),
            validation: () => {
                if (isDefined(formValue?.regions?.length) && formValue.regions.length > 0) {
                    return undefined;
                }

                if (isDefined(formValue?.countries?.length) && formValue.countries.length > 0) {
                    return undefined;
                }

                return 'At least one region/country must be selected';
            },
        },
        user: {},
    }),
};

export default formSchema;
