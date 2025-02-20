import {
    useContext,
    useMemo,
} from 'react';
import {
    BlockLoading,
    Button,
    PasswordInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import UserContext from '#contexts/user';
import useAlert from '#hooks/useAlert';
import { getUserName } from '#utils/domain/user';
import { useLazyRequest } from '#utils/restRequest';
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
type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValue: FormFields = {
};

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

/** @knipignore */
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

    const alert = useAlert();

    const {
        trigger: login,
        pending: loginPending,
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
                displayName: getUserName({
                    first_name: response.first,
                    last_name: response.last,
                    username: response.username,
                }),
                token: response.token,
                expires: response.expires,
            });
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.loginFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const handleFormSubmit = useMemo(
        () => createSubmitHandler(
            validate,
            setError,
            login,
        ),
        [validate, setError, login],
    );

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

    return (
        <Page
            className={styles.login}
            title={strings.loginTitle}
            heading={strings.loginHeader}
            description={strings.loginSubHeader}
            mainSectionClassName={styles.mainSection}
        >
            {loginPending && <BlockLoading />}
            {!loginPending && (
                <form
                    className={styles.form}
                    onSubmit={handleFormSubmit}
                >
                    <NonFieldError
                        error={formError}
                        withFallbackError
                    />
                    <div className={styles.fields}>
                        <TextInput
                            name="username"
                            label={strings.loginEmailUsername}
                            value={formValue.username}
                            onChange={setFieldValue}
                            error={fieldError?.username}
                            withAsterisk
                            disabled={loginPending}
                            autoFocus
                        />
                        <PasswordInput
                            name="password"
                            label={strings.loginPassword}
                            value={formValue.password}
                            onChange={setFieldValue}
                            error={fieldError?.password}
                            withAsterisk
                            disabled={loginPending}
                        />
                    </div>
                    <div className={styles.utilityLinks}>
                        <Link
                            to="recoverAccount"
                            title={strings.loginRecoverTitle}
                            withUnderline
                        >
                            {strings.loginForgotUserPass}
                        </Link>
                        <Link
                            to="resendValidationEmail"
                            title={strings.loginResendValidationTitle}
                            withUnderline
                        >
                            {strings.loginResendValidation}
                        </Link>
                    </div>
                    <div className={styles.actions}>
                        <Button
                            name={undefined}
                            type="submit"
                            disabled={loginPending}
                        >
                            {strings.loginButton}
                        </Button>
                        <div className={styles.signUp}>
                            {signupInfo}
                        </div>
                    </div>
                </form>
            )}
        </Page>
    );
}

Component.displayName = 'Login';
