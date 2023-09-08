import {
    useCallback,
    useContext,
} from 'react';
import {
    useForm,
    type ObjectSchema,
    requiredStringCondition,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isFalsyString } from '@togglecorp/fujs';

import Page from '#components/Page';
import TextInput from '#components/TextInput';
import PasswordInput from '#components/PasswordInput';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { useLazyRequest } from '#utils/restRequest';
import UserContext from '#contexts/user';
import { transformObjectError } from '#utils/restRequest/error';

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
    const { setUserAuth: setUser } = useContext(UserContext);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        trigger: login,
    } = useLazyRequest({
        method: 'POST',
        url: '/get_auth_token',
        body: (body: FormFields) => body,
        onSuccess: (responseUnsafe) => {
            // FIXME: fix typing in server (low priority)
            const response = responseUnsafe as ResponseFields;
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

            setError(transformObjectError(formErrors, () => undefined));
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
                    <PasswordInput
                        name="password"
                        label={strings.loginPassword}
                        value={formValue.password}
                        onChange={setFieldValue}
                        error={fieldError?.password}
                        withAsterisk
                    />
                </div>
                <div className={styles.utilityLinks}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                        // FIXME: add link
                        // to="recoverAccount"
                        to={null}
                        title={strings.loginRecoverTitle}
                        withUnderline
                    >
                        {strings.loginForgotUserPass}
                    </Link>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                        // FIXME: add link
                        // to="resendValidation"
                        to={null}
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
