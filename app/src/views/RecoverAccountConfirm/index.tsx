import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Button,
    PasswordInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isTruthyString } from '@togglecorp/fujs';
import {
    addCondition,
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    requiredStringCondition,
    undefinedValue,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface FormFields {
    new_password?: string;
    confirmPassword?: string;
}

const defaultFormValue: FormFields = {
};

type ChangeRecoverPasswordRequestBody = GoApiBody<'/change_recover_password', 'POST'>;
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
            new_password: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
        };
        baseSchema = addCondition(
            baseSchema,
            value,
            ['new_password'],
            ['confirmPassword'],
            (val) => ({
                confirmPassword: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                    forceValue: undefinedValue,
                    validations: [getPasswordMatchCondition(val?.new_password)],
                },
            }),
        );

        return baseSchema;
    },
};

/** @knipignore */
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
        url: '/change_recover_password',
        body: (body: ChangeRecoverPasswordRequestBody) => body,
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
                new_password: formValues.new_password,
                token,
                username,
            } as ChangeRecoverPasswordRequestBody);
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
                    name="new_password"
                    label={strings.newPassword}
                    value={formValue.new_password}
                    onChange={setFieldValue}
                    error={fieldError?.new_password}
                    disabled={pending}
                    withAsterisk
                    autoFocus
                />
                <PasswordInput
                    name="confirmPassword"
                    label={strings.confirmPassword}
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
