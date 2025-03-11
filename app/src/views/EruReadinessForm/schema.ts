import {
    type ArraySchema,
    type ObjectSchema,
    type PartialForm,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type EruReadinessPostBody = GoApiBody<'/api/v2/eru-readiness/', 'POST'>;
export type EruReadinessBody = GoApiBody<'/api/v2/eru-readiness/{id}/', 'PATCH'>;

export type BaseFormType = PartialForm<EruReadinessBody>;

type FormSchema = ObjectSchema<BaseFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
export type EruType = (NonNullable<NonNullable<EruReadinessBody['eru_types']>>[number]) & {
    client_id: string;
};
type EruTypeSchema = ObjectSchema<PartialForm<EruType>, BaseFormType>;
type EruTypeSchemaFields = ReturnType<EruTypeSchema['fields']>;
type EruTypesSchema = ArraySchema<PartialForm<EruType>, BaseFormType>;
type CollectionsSchemaMember = ReturnType<EruTypesSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        eru_owner: {
            required: true,
        },
        eru_types: {
            keySelector: (col) => col.client_id,
            member: (): CollectionsSchemaMember => ({
                fields: (): EruTypeSchemaFields => ({
                    client_id: { },
                    id: { },
                    type: { required: true },
                    equipment_readiness: { required: true },
                    people_readiness: { required: true },
                    funding_readiness: { required: true },
                    comment: { },
                    has_capacity_to_lead: { },
                    has_capacity_to_support: { },
                }),
            }),
        },
    }),
};

export default schema;
