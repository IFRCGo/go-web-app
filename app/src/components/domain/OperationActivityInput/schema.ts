import {
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

type OperationActivity = components<'write'>['schemas']['OperationActivity'];

export type OperationActivityFormFields = PartialForm<Omit<OperationActivity, 'timeframe_display'>> & {
    client_id: string;
}

type OperationActivitySchema = ObjectSchema<OperationActivityFormFields>;

const schema: OperationActivitySchema = {
    fields: (): ReturnType<OperationActivitySchema['fields']> => ({
        client_id: {},
        id: { defaultValue: undefinedValue },
        activity: {
            // FIXME: add validation for character limit
            required: true,
            requiredValidation: requiredStringCondition,
        },
        time_value: {},
        timeframe: {},
    }),
};

export default schema;
