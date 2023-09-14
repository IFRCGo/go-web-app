import { useMemo } from 'react';
import {
    useForm,
    type ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import TextInput from '#components/TextInput';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
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

const formSchema: ObjectSchema<FormFields> = {
    fields: () => ({
        email: {
            required: true,
            requiredCondition: requiredStringCondition,
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
        },
    });

    const fieldError = getErrorObject(formError);
    const handleFormSubmit = useMemo(
        () => createSubmitHandler(
            validate,
            setError,
            requestPasswordRecovery,
        ),
        [validate, setError, requestPasswordRecovery],
    );

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
                <NonFieldError error={formError} />
                <TextInput
                    name="email"
                    label={strings.emailInputLabel}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    withAsterisk
                />
                <Button
                    name={undefined}
                    type="submit"
                    className={styles.submitButton}
                >
                    {strings.submitButtonLabel}
                </Button>
            </form>
        </Page>
    );
}

Component.displayName = 'RecoverAccount';
