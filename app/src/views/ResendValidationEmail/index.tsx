import { useMemo } from 'react';
import {
    Button,
    Container,
    ListView,
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

interface FormFields {
    username?: string;
}

const defaultFormValue: FormFields = {
};

type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
            required: true,
            requiredValidation: requiredStringCondition,
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
        url: '/resend_validation',
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
            title={strings.pageTitle}
            heading={strings.pageHeading}
        >
            <form onSubmit={handleFormSubmit}>
                <Container
                    withCenteredContent
                    headerDescription={strings.pageDescription}
                    spacing="2xl"
                >
                    <ListView
                        layout="block"
                        spacing="2xl"
                    >
                        <NonFieldError
                            error={formError}
                            withFallbackError
                        />
                        <TextInput
                            name="username"
                            label={strings.emailInputLabel}
                            value={formValue.username}
                            onChange={setFieldValue}
                            error={fieldError?.username}
                            disabled={pending}
                            withAsterisk
                            autoFocus
                        />
                        <ListView withCenteredContents>
                            <Button
                                name={undefined}
                                type="submit"
                                disabled={pending}
                            >
                                {strings.submitButtonLabel}
                            </Button>
                        </ListView>
                    </ListView>
                </Container>
            </form>
        </Page>
    );
}

Component.displayName = 'ResendValidationEmail';
