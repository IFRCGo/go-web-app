import {
    type ObjectSchema,
    type PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

type OtherProfile = components<'write'>['schemas']['OtherProfile'] & {
    client_id: string;
};

export type PartialOtherProfileFields = PartialForm<OtherProfile, 'client_id'>;
type OtherProfileFormSchema = ObjectSchema<PartialOtherProfileFields>;

const otherProfileSchema: OtherProfileFormSchema = {
    fields: (): ReturnType<OtherProfileFormSchema['fields']> => ({
        client_id: {},
        id: { defaultValue: undefinedValue },
        number: { required: true },
        position: { required: true },
    }),
};

export default otherProfileSchema;
