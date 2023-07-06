import { useCallback } from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface UserPasswordChange {
    id: number;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// FIXME: Need to add an api dedicated for changing password
type FormFields = PartialForm<Omit<UserPasswordChange, 'id'>>;

const defaultFormValue: FormFields = {};

const formSchema: ObjectSchema<FormFields> = {
    validation: (value) => {
        if (
            value?.newPassword
            && value?.confirmNewPassword
            && value.newPassword !== value.confirmNewPassword
        ) {
            return 'Passwords do not match!';
        }
        return undefined;
    },
    fields: () => ({
        oldPassword: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        newPassword: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        confirmNewPassword: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
    }),
};

interface Props {
    handleCancelButton?: () => void;
}

function ChangePasswordsModal(props: Props) {
    const {
        handleCancelButton,
    } = props;

    const strings = useTranslation(i18n);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const fieldError = getErrorObject(formError);

    // FIXME: Add an api for change password
    const handleConfirmPasswordChange = useCallback(() => {
        // eslint-disable-next-line no-console
        console.log('Add api for change password::::');
    }, []);

    const handleSubmitPassword = createSubmitHandler(
        validate,
        setError,
        handleConfirmPasswordChange,
    );

    return (
        <Modal
            heading={strings.changeUserPassword}
            headingLevel={3}
            onClose={handleCancelButton}
            hideCloseButton
            className={styles.changePassword}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleCancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleSubmitPassword}
                    >
                        Confirm
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
                name="oldPassword"
                type="password"
                label={strings.oldPassword}
                value={formValue.oldPassword}
                onChange={setFieldValue}
                error={fieldError?.oldPassword}
            />
            <TextInput
                name="newPassword"
                type="password"
                label={strings.newPassword}
                value={formValue.newPassword}
                onChange={setFieldValue}
                error={fieldError?.newPassword}
            />
            <TextInput
                name="confirmNewPassword"
                type="password"
                label={strings.confirmNewPassword}
                value={formValue.confirmNewPassword}
                onChange={setFieldValue}
                error={fieldError?.confirmNewPassword}
            />
        </Modal>
    );
}

export default ChangePasswordsModal;
