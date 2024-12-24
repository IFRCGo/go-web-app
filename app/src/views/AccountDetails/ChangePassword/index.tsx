import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isTruthyString } from '@togglecorp/fujs';
import {
    addCondition,
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PasswordChangeRequestBody = GoApiBody<'/change_password', 'POST'>;

type PartialFormValue = PartialForm<PasswordChangeRequestBody & { confirmNewPassword: string }>;
const defaultFormValue: PartialFormValue = {};

type FormSchema = ObjectSchema<PartialFormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

interface Props {
    handleModalCloseButton: () => void;
}

function ChangePasswordModal(props: Props) {
    const {
        handleModalCloseButton,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const getPasswordMatchCondition = useCallback((referenceVal: string | undefined) => {
        function passwordMatchCondition(val: string | undefined) {
            if (isTruthyString(val) && isTruthyString(referenceVal) && val !== referenceVal) {
                return strings.changePasswordDoNotMatch;
            }
            return undefined;
        }
        return passwordMatchCondition;
    }, [
        strings.changePasswordDoNotMatch,
    ]);

    const formSchema: FormSchema = useMemo(() => (
        {
            fields: (value): FormSchemaFields => {
                let fields: FormSchemaFields = {
                    old_password: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    new_password: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    confirmNewPassword: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                        forceValue: undefinedValue,
                    },
                };

                fields = addCondition(
                    fields,
                    value,
                    ['new_password'],
                    ['confirmNewPassword'],
                    (val) => ({
                        confirmNewPassword: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                            forceValue: undefinedValue,
                            validations: [getPasswordMatchCondition(val?.new_password)],
                        },
                    }),
                );
                return fields;
            },
        }
    ), [getPasswordMatchCondition]);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        pending: updatePasswordPending,
        trigger: updatePassword,
    } = useLazyRequest({
        method: 'POST',
        url: '/change_password',
        body: (body: PasswordChangeRequestBody) => body,
        onSuccess: () => {
            alert.show(
                strings.changePasswordSuccessMessage,
                { variant: 'success' },
            );
            handleModalCloseButton();
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.changePasswordFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const handleConfirmPasswordChange = useCallback((formValues: PartialFormValue) => {
        const passwordFormValues = {
            ...formValues,
        };
        updatePassword(passwordFormValues as PasswordChangeRequestBody);
    }, [updatePassword]);

    const handleSubmitPassword = createSubmitHandler(
        validate,
        setError,
        handleConfirmPasswordChange,
    );

    const fieldError = getErrorObject(formError);

    return (
        <Modal
            heading={strings.changePasswordModalHeading}
            headingLevel={3}
            onClose={handleModalCloseButton}
            withoutCloseButton
            className={styles.changePassword}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleModalCloseButton}
                    >
                        {strings.changePasswordCancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleSubmitPassword}
                        disabled={updatePasswordPending}
                    >
                        {strings.changePasswordConfirmButtonLabel}
                    </Button>
                </>
            )}
            childrenContainerClassName={styles.content}
        >
            <NonFieldError
                className={styles.serverError}
                error={formError}
                withFallbackError
            />
            <TextInput
                name="old_password"
                type="password"
                label={strings.oldPasswordInputLabel}
                value={formValue.old_password}
                onChange={setFieldValue}
                error={fieldError?.old_password}
                disabled={updatePasswordPending}
                withAsterisk
                autoFocus
            />
            <TextInput
                name="new_password"
                type="password"
                label={strings.newPasswordInputLabel}
                value={formValue.new_password}
                onChange={setFieldValue}
                error={fieldError?.new_password}
                disabled={updatePasswordPending}
                withAsterisk
            />
            <TextInput
                name="confirmNewPassword"
                type="password"
                label={strings.confirmNewPasswordInputLabel}
                value={formValue.confirmNewPassword}
                onChange={setFieldValue}
                error={fieldError?.confirmNewPassword}
                disabled={updatePasswordPending}
                withAsterisk
            />
        </Modal>
    );
}

export default ChangePasswordModal;
