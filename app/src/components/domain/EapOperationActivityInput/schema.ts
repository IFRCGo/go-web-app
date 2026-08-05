import {
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

type ReadinessOperationActivity = PurgeNull<components<'write'>['schemas']['OperationActivity']>;
type PrepositioningOperationActivity = PurgeNull<components<'write'>['schemas']['PrepositioningOperationActivity']>;
type EarlyActionOperationActivity = PurgeNull<components<'write'>['schemas']['EarlyActionOperationActivity']>;

export type ActivityInputType = 'readiness_activities' | 'prepositioning_activities' | 'early_action_activities';

type OperationActivity = Omit<ReadinessOperationActivity, 'activation_one' | 'activation_two'>
    & Pick<EarlyActionOperationActivity, 'activation_one' | 'activation_two'>
    & Pick<PrepositioningOperationActivity, 'timeframe' | 'time_value'>;

export type OperationActivityFormFields = PartialForm<OperationActivity> & {
    client_id: string;
}

type OperationActivitySchema = ObjectSchema<OperationActivityFormFields>;

const schema = (isSubmit: boolean, type: ActivityInputType): OperationActivitySchema => ({
    fields: (): ReturnType<OperationActivitySchema['fields']> => ({
        client_id: {},
        id: { defaultValue: undefinedValue },
        activity: {
            // FIXME: add validation for character limit
            required: isSubmit,
            requiredValidation: requiredStringCondition,
        },
        time_value: {},
        // Prepositioning activities are not tied to a timeframe
        timeframe: {
            required: isSubmit && type !== 'prepositioning_activities',
        },
        // Activations are only applicable to prepositioning and early actions
        ...(type === 'readiness_activities'
            ? {
                activation_one: { forceValue: undefinedValue },
                activation_two: { forceValue: undefinedValue },
            }
            : {
                activation_one: {},
                activation_two: {},
            }),
    }),
});

export default schema;
