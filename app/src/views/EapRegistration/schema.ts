import {
    addCondition,
    emailCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
} from '@togglecorp/toggle-form';

import {
    DISASTER_TYPE_EPIDEMIC,
    DISASTER_TYPE_OTHER,
} from '#utils/constants';
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
    fields: (formValue): FormSchemaFields => {
        let formFields: FormSchemaFields = {
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
            national_society_contact_name: { required: true },
            national_society_contact_title: { required: true },
            national_society_contact_email: {
                required: true,
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
        };

        formFields = addCondition(
            formFields,
            formValue,
            ['disaster_type'],
            ['disaster_sub_type'],
            (val): Pick<FormSchemaFields, 'disaster_sub_type'> => {
                if (val?.disaster_type === DISASTER_TYPE_EPIDEMIC
                     || val?.disaster_type === DISASTER_TYPE_OTHER) {
                    return {
                        disaster_sub_type: {},
                    };
                }
                return {
                    disaster_sub_type: { forceValue: nullValue },
                };
            },
        );

        return formFields;
    },
};
