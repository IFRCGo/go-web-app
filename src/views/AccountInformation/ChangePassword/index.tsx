import { useCallback, useContext } from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
    undefinedValue,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import type { paths } from '#generated/types';
import UserContext from '#contexts/user';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PostChangePassword = paths['/change_password']['post'];
type PasswordChangeResponse = PostChangePassword['requestBody']['content']['application/json'];

type FormFields = PartialForm<PasswordChangeResponse & { confirmNewPassword: string }>;

const defaultFormValue: FormFields = {};

const formSchema: ObjectSchema<FormFields> = {
    validation: (value) => {
        if (
            value?.new_password
            && value?.confirmNewPassword
            && value.new_password !== value.confirmNewPassword
        ) {
            // FIXME: use translation
            return 'Passwords do not match!';
        }
        return undefined;
    },
    fields: () => ({
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
    }),
};

interface Props {
    handleModalCloseButton: () => void;
}

function ChangePasswordsModal(props: Props) {
    const { handleModalCloseButton } = props;

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

    const fieldError = getErrorObject(formError);

    const {
        pending: updatePasswordPending,
        trigger: updatePassword,
    } = useLazyRequest<PasswordChangeResponse, FormFields>({
        method: 'POST',
        url: '/change_password',
        body: (body) => body,
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

            // FIXME: Error message from server is not properly sent
            setError(formErrors);

            alert.show(
                strings.changePasswordFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const handleConfirmPasswordChange = useCallback((formValues: PartialForm<FormFields>) => {
        const passwordFormValues = {
            ...formValues,
            username: userAuth?.username,
            token: userAuth?.token,
        };
        updatePassword(passwordFormValues as FormFields);
    }, [userAuth, updatePassword]);

    const handleSubmitPassword = createSubmitHandler(
        validate,
        setError,
        handleConfirmPasswordChange,
    );

    return (
        <Modal
            heading={strings.changePasswordModalHeading}
            headingLevel={3}
            onClose={handleModalCloseButton}
            hideCloseButton
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
            bodyClassName={styles.content}
        >
            <NonFieldError
                className={styles.serverError}
                error={formError}
            />
            <TextInput
                name="password"
                type="password"
                label={strings.oldPasswordInputLabel}
                value={formValue.password}
                onChange={setFieldValue}
                error={fieldError?.password}
            />
            <TextInput
                name="new_password"
                type="password"
                label={strings.newPasswordInputLabel}
                value={formValue.new_password}
                onChange={setFieldValue}
                error={fieldError?.new_password}
            />
            <TextInput
                name="confirmNewPassword"
                type="password"
                label={strings.confirmNewPasswordInputLabel}
                value={formValue.confirmNewPassword}
                onChange={setFieldValue}
                error={fieldError?.confirmNewPassword}
            />
        </Modal>
    );
}

export default ChangePasswordsModal;
