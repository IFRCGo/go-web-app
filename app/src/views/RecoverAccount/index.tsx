import { useMemo } from 'react';
import {
    Button,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface FormFields {
    email?: string;
}

const defaultFormValue: FormFields = {
};

type FormSchema = ObjectSchema<FormFields>;
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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { navigate } = useRouting();
    const {
        value: formValue,
        error: formError,
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
        body: (body: FormFields) => body,
        onSuccess: () => {
            navigate('login');
            alert.show(
                strings.successfulMessageTitle,
                {
                    description: strings.successfulMessageDescription,
                    variant: 'success',
                },
            );
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

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

    const fieldError = getErrorObject(formError);

    return (
        <Page
            className={styles.recoverAccount}
            title={strings.pageTitle}
            heading={strings.pageHeading}
            description={strings.pageDescription}
        >
            <form
                className={styles.form}
                onSubmit={handleFormSubmit}
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                <TextInput
                    name="email"
                    label={strings.emailInputLabel}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    disabled={pending}
                    withAsterisk
                    autoFocus
                />
                <Button
                    name={undefined}
                    type="submit"
                    className={styles.submitButton}
                    disabled={pending}
                >
                    {strings.submitButtonLabel}
                </Button>
            </form>
        </Page>
    );
}

Component.displayName = 'RecoverAccount';
