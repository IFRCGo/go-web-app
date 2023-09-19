import { useCallback, useContext } from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
    undefinedValue,
    addCondition,
} from '@togglecorp/toggle-form';
import {
    isTruthyString,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { GoApiBody, useLazyRequest } from '#utils/restRequest';
import UserContext from '#contexts/user';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PasswordChangeRequestBody = GoApiBody<'/change_password', 'POST'>;

function getPasswordMatchCondition(referenceVal: string | undefined) {
    function passwordMatchCondition(val: string | undefined) {
        if (isTruthyString(val) && isTruthyString(referenceVal) && val !== referenceVal) {
            return 'Passwords do not match';
        }
        return undefined;
    }

    return passwordMatchCondition;
}

type PartialFormValue = PartialForm<PasswordChangeRequestBody & { confirmNewPassword: string }>;
const defaultFormValue: PartialFormValue = {};

type FormSchema = ObjectSchema<PartialFormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const formSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let fields: FormSchemaFields = {
            username: {},
            token: {},
            password: {
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
};

interface Props {
    handleModalCloseButton: () => void;
}

function ChangePasswordModal(props: Props) {
    const {
        handleModalCloseButton,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { userAuth } = useContext(UserContext);

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
        // FIXME: We should not pass username and token to server
        const passwordFormValues = {
            ...formValues,
            username: userAuth?.username,
            token: userAuth?.token,
        };
        updatePassword(passwordFormValues as PasswordChangeRequestBody);
    }, [userAuth, updatePassword]);

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
                name="password"
                type="password"
                label={strings.oldPasswordInputLabel}
                value={formValue.password}
                onChange={setFieldValue}
                error={fieldError?.password}
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
