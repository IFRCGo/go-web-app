import {
    emailCondition,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type EapRegisterRequestBody = PurgeNull<GoApiBody<'/api/v2/eap-registration/', 'POST'>>;

export const defaultFormValue: EapRegisterFormFields = {
    eap_type: undefined,
    expected_submission_time: undefined,
};

export type EapRegisterFormFields = PartialForm<EapRegisterRequestBody>;

type FormSchema = ObjectSchema<EapRegisterFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

export const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        national_society: {
            required: true,
        },
        country: {
            required: true,
        },
        disaster_type: {
            required: true,
        },
        eap_type: {},
        expected_submission_time: {},
        partners: {
            required: true,
        },
        national_society_contact_name: {},
        national_society_contact_title: {},
        national_society_contact_email: {
            validations: [emailCondition],
        },
        national_society_contact_phone_number: {},
        ifrc_contact_name: {},
        ifrc_contact_title: {},
        ifrc_contact_email: {
            validations: [emailCondition],
        },
        ifrc_contact_phone_number: {},
        dref_focal_point_name: {},
        dref_focal_point_title: {},
        dref_focal_point_email: {
            validations: [emailCondition],
        },
        dref_focal_point_phone_number: {},
    }),
};
