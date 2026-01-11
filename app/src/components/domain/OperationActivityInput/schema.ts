import {
    type ObjectSchema,
    type PartialForm,
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
        activity: {},
        time_value: {},
        timeframe: {},
    }),
};

export default schema;
