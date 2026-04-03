import {
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

type OperationActivity = components<'write'>['schemas']['OperationActivity'];

export type OperationActivityFormFields = PartialForm<OperationActivity> & {
    client_id: string;
}

type OperationActivitySchema = ObjectSchema<OperationActivityFormFields>;

const schema = (isSubmit: boolean): OperationActivitySchema => ({
    fields: (): ReturnType<OperationActivitySchema['fields']> => ({
        client_id: {},
        id: { defaultValue: undefinedValue },
        activity: {
            // FIXME: add validation for character limit
            required: isSubmit,
            requiredValidation: requiredStringCondition,
        },
        time_value: {},
        timeframe: {},
    }),
});

export default schema;
