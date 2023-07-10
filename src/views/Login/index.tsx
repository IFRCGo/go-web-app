import {
    useCallback,
    useContext,
} from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isFalsyString } from '@togglecorp/fujs';

import Page from '#components/Page';
import TextInput from '#components/TextInput';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { useLazyRequest } from '#utils/restRequest';
import UserContext from '#contexts/user';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface ResponseFields {
    expires: string;
    first: string | null;
    id: number;
    last: string | null;
    token: string;
    username: string;
}

interface FormFields {
    username?: string;
    password?: string;
}

const defaultFormValue: FormFields = {
};

const formSchema: ObjectSchema<FormFields> = {
    fields: () => ({
        username: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        password: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
    }),
};

function getDisplayName(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    username: string,
) {
    if (isFalsyString(firstName) && isFalsyString(lastName)) {
        return username;
    }

    return [
        firstName,
        lastName,
    ].filter(Boolean).join(' ');
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { setUser } = useContext(UserContext);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        trigger: login,
    } = useLazyRequest<ResponseFields, FormFields>({
        method: 'POST',
        url: 'get_auth_token',
        body: (body) => body,
        onSuccess: (response) => {
            setUser({
                id: response.id,
                username: response.username,
                firstName: response.first ?? undefined,
                lastName: response.last ?? undefined,
                displayName: getDisplayName(
                    response.first,
                    response.last,
                    response.username,
                ),
                token: response.token,
            });
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(formErrors);
        },
    });

    const fieldError = getErrorObject(formError);
    const signupInfo = resolveToComponent(
        strings.loginDontHaveAccount,
        {
            signUpLink: (
                <Link
                    to="register"
                    withUnderline
                >
                    {strings.loginSignUp}
                </Link>
            ),
        },
    );

    const handleLoginButtonClick = useCallback(() => {
        const result = validate();

        if (result.errored) {
            setError(result.error);
            return;
        }

        const body = result.value;
        login(body);
    }, [validate, setError, login]);

    return (
        <Page
            className={styles.login}
            title={strings.loginTitle}
            heading={strings.loginHeader}
            description={strings.loginSubHeader}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.form}>
                <NonFieldError error={formError} />
                <div className={styles.fields}>
                    <TextInput
                        name="username"
                        label={strings.loginEmailUsername}
                        value={formValue.username}
                        onChange={setFieldValue}
                        error={fieldError?.username}
                        withAsterisk
                    />
                    <TextInput
                        name="password"
                        type="password"
                        label={strings.loginPassword}
                        value={formValue.password}
                        onChange={setFieldValue}
                        error={fieldError?.password}
                        withAsterisk
                    />
                </div>
                <div className={styles.utilityLinks}>
                    <Link
                        to="recover-account"
                        title={strings.loginRecoverTitle}
                        withUnderline
                    >
                        {strings.loginForgotUserPass}
                    </Link>
                    <Link
                        to="resend-validation"
                        title={strings.loginResendValidationTitle}
                        withUnderline
                    >
                        {strings.loginResendValidation}
                    </Link>
                </div>
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        onClick={handleLoginButtonClick}
                    >
                        {strings.loginButton}
                    </Button>
                    <div className={styles.signUp}>
                        {signupInfo}
                    </div>
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'Login';
