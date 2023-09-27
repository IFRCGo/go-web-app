import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    useForm,
    type ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
    addCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';
import {
    isTruthyString,
} from '@togglecorp/fujs';

import Page from '#components/Page';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import PasswordInput from '#components/PasswordInput';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    useLazyRequest,
    GoApiBody,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface FormFields {
    newPassword?: string;
    confirmPassword?: string;
}

const defaultFormValue: FormFields = {
};

type ChangePasswordRequestBody = GoApiBody<'/change_password', 'POST'>;
type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

function getPasswordMatchCondition(referenceVal: string | undefined) {
    function passwordMatchCondition(val: string | undefined) {
        if (isTruthyString(val) && isTruthyString(referenceVal) && val !== referenceVal) {
            return 'Passwords do not match';
        }
        return undefined;
    }

    return passwordMatchCondition;
}

const formSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let baseSchema = {
            newPassword: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
        };
        baseSchema = addCondition(
            baseSchema,
            value,
            ['newPassword'],
            ['confirmPassword'],
            (val) => ({
                confirmPassword: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                    forceValue: undefinedValue,
                    validations: [getPasswordMatchCondition(val?.newPassword)],
                },
            }),
        );

        return baseSchema;
    },
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { username, token } = useParams<{ username: string, token: string }>();
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
        url: '/change_password',
        body: (body: ChangePasswordRequestBody) => body,
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

    const handleChangePassword = useCallback(
        (formValues: FormFields) => {
            requestPasswordRecovery({
                new_password: formValues.newPassword,
                token,
                username,
            } as ChangePasswordRequestBody);
        },
        [requestPasswordRecovery, token, username],
    );

    const handleFormSubmit = createSubmitHandler(
        validate,
        setError,
        handleChangePassword,
    );

    const fieldError = getErrorObject(formError);

    return (
        <Page
            className={styles.recoverAccountConfirm}
            title={strings.pageTitle}
            heading={strings.pageHeading}
        >
            <form
                className={styles.form}
                onSubmit={handleFormSubmit}
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                <PasswordInput
                    name="newPassword"
                    label={strings.newPassword}
                    value={formValue.newPassword}
                    onChange={setFieldValue}
                    error={fieldError?.newPassword}
                    disabled={pending}
                    withAsterisk
                    autoFocus
                />
                <PasswordInput
                    name="confirmPassword"
                    label={strings.confrimPassword}
                    value={formValue.confirmPassword}
                    onChange={setFieldValue}
                    error={fieldError?.confirmPassword}
                    disabled={pending}
                    withAsterisk
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

Component.displayName = 'RecoverAccountConfirm';
