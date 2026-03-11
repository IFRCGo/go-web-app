import { type DeepReplace } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    type ArraySchema,
    type ObjectSchema,
    type PartialForm,
    requiredListCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type EruReadinessPatchBody = GoApiBody<'/api/v2/eru-readiness/{id}/', 'PATCH'>;
export type EruReadinessPostBody = GoApiBody<'/api/v2/eru-readiness/', 'POST'>;
type RawEruItem = NonNullable<EruReadinessPatchBody['eru_types']>[number];
type EruItem = RawEruItem & { client_id: string }

type EruReadinessFormFields = DeepReplace<
    EruReadinessPatchBody,
    RawEruItem,
    EruItem
>;

export type FormType = PartialForm<EruReadinessFormFields, 'client_id'>;

export type PartialEruItem = NonNullable<FormType['eru_types']>[number];

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type EruItemSchema = ObjectSchema<PartialForm<EruItem, 'client_id'>, FormType>;
type EruItemSchemaFields = ReturnType<EruItemSchema['fields']>;
type EruItemListSchema = ArraySchema<PartialForm<EruItem, 'client_id'>, FormType>;
type EruItemListMemberSchema = ReturnType<EruItemListSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        eru_owner: {
            required: true,
        },
        eru_types: {
            required: true,
            requiredValidation: requiredListCondition,
            defaultValue: [],
            keySelector: (col) => col.client_id,
            validation: (value) => {
                if (isNotDefined(value) || value.length === 0) {
                    // FIXME: add translations
                    return 'Please select at least one ERU type';
                }

                return undefined;
            },
            member: (): EruItemListMemberSchema => ({
                fields: (): EruItemSchemaFields => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    type: { required: true },
                    equipment_readiness: { required: true },
                    people_readiness: { required: true },
                    funding_readiness: { required: true },
                    ns_contribution: { required: true },
                    comment: {},
                }),
            }),
        },
    }),
};

export default schema;
