import {
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import { positiveNumberCondition } from '#utils/form';

type Indicator = components<'write'>['schemas']['Indicator'];

export type IndicatorFormFields = PartialForm<Indicator> & {
    client_id: string;
}

type IndicatorSchema = ObjectSchema<IndicatorFormFields>;

const schema = (isSubmit: boolean): IndicatorSchema => ({
    fields: (): ReturnType<IndicatorSchema['fields']> => ({
        client_id: {},
        id: { defaultValue: undefinedValue },
        title: {
            // FIXME: add validation for character limit
            required: isSubmit,
            requiredValidation: requiredStringCondition,
        },
        target: {
            required: isSubmit,
            validations: [positiveNumberCondition],
        },
    }),
});

export default schema;
