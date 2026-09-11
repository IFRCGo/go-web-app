import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createSubmitHandler,
    type ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

interface RecoverAccountFormFields {
    email?: string;
}

const defaultFormValue: RecoverAccountFormFields = {
};

type FormSchema = ObjectSchema<RecoverAccountFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
            // FIXME: Not adding email condition as we are not sure if we also
            // support usernames
        },
    }),
};

interface Props {
    onSuccess?: () => void;
}

function useRecoverAccountForm(props: Props) {
    const { onSuccess } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        value,
        error,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        trigger: requestPasswordRecovery,
        pending,
    } = useLazyRequest({
        method: 'POST',
        url: '/recover_password',
        body: (body: RecoverAccountFormFields) => body,
        onSuccess: () => {
            alert.show(
                strings.successfulMessageTitle,
                {
                    description: strings.successfulMessageDescription,
                    variant: 'success',
                },
            );

            onSuccess?.();
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                },
            } = err;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.failureMessageTitle,
                { variant: 'danger' },
            );
        },
    });

    const handleFormSubmit = useMemo(
        () => createSubmitHandler(
            validate,
            setError,
            requestPasswordRecovery,
        ),
        [validate, setError, requestPasswordRecovery],
    );

    return {
        value,
        error,
        setFieldValue,
        pending,
        handleFormSubmit,
    };
}

export default useRecoverAccountForm;
