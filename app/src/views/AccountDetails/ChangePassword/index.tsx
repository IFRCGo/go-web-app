import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Description,
    ListView,
    Modal,
    RadioInput,
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

import RecoverAccountForm from '#components/domain/RecoverAccountForm';
import useRecoverAccountForm from '#components/domain/RecoverAccountForm/useRecoverAccountForm';
import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

type PasswordChangeRequestBody = GoApiBody<'/change_password', 'POST'>;

type PartialFormValue = PartialForm<PasswordChangeRequestBody & { confirmNewPassword: string }>;
const defaultFormValue: PartialFormValue = {};

type FormSchema = ObjectSchema<PartialFormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const CHANGE_METHOD_OLD_PASSWORD = 'oldPassword' as const;
const CHANGE_METHOD_EMAIL_LINK = 'emailLink' as const;

type ChangeMethod = typeof CHANGE_METHOD_OLD_PASSWORD | typeof CHANGE_METHOD_EMAIL_LINK;

interface ChangeMethodOption {
    key: ChangeMethod;
    label: string;
}

const changeMethodKeySelector = (option: ChangeMethodOption) => option.key;
const changeMethodLabelSelector = (option: ChangeMethodOption) => option.label;

interface Props {
    handleModalCloseButton: () => void;
}

function ChangePasswordModal(props: Props) {
    const {
        handleModalCloseButton,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const [changeMethod, setChangeMethod] = useState<ChangeMethod>(CHANGE_METHOD_OLD_PASSWORD);

    const changeMethodOptions: ChangeMethodOption[] = useMemo(
        () => ([
            {
                key: CHANGE_METHOD_OLD_PASSWORD,
                label: strings.changeMethodOldPasswordLabel,
            },
            {
                key: CHANGE_METHOD_EMAIL_LINK,
                label: strings.changeMethodEmailLinkLabel,
            },
        ]),
        [strings.changeMethodOldPasswordLabel, strings.changeMethodEmailLinkLabel],
    );

    // NOTE: the recovery email is the way forward from here, so the password
    // change is abandoned along with the modal
    const handleRecoverAccountSuccess = useCallback(
        () => {
            handleModalCloseButton();
        },
        [handleModalCloseButton],
    );

    const {
        value: recoverAccountValue,
        error: recoverAccountError,
        setFieldValue: setRecoverAccountFieldValue,
        pending: recoverAccountPending,
        handleFormSubmit: handleRecoverAccountSubmit,
    } = useRecoverAccountForm({ onSuccess: handleRecoverAccountSuccess });

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

    const usingEmailLink = changeMethod === CHANGE_METHOD_EMAIL_LINK;

    return (
        <Modal
            heading={strings.changePasswordModalHeading}
            onClose={handleModalCloseButton}
            withoutCloseButton
            footerActions={(
                <ListView spacing="sm">
                    <Button
                        name={undefined}
                        onClick={handleModalCloseButton}
                    >
                        {strings.changePasswordCancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={usingEmailLink ? handleRecoverAccountSubmit : handleSubmitPassword}
                        disabled={usingEmailLink ? recoverAccountPending : updatePasswordPending}
                        styleVariant="filled"
                    >
                        {strings.changePasswordConfirmButtonLabel}
                    </Button>
                </ListView>
            )}
            withHeaderBorder
            withFooterBorder
        >
            <ListView
                layout="block"
            >
                <RadioInput
                    name={undefined}
                    label={strings.changeMethodLabel}
                    options={changeMethodOptions}
                    keySelector={changeMethodKeySelector}
                    labelSelector={changeMethodLabelSelector}
                    value={changeMethod}
                    onChange={setChangeMethod}
                    radioListLayout="inline"
                />
                {usingEmailLink ? (
                    <>
                        <RecoverAccountForm
                            value={recoverAccountValue}
                            error={recoverAccountError}
                            setFieldValue={setRecoverAccountFieldValue}
                            disabled={recoverAccountPending}
                        />
                        <Description withLightText>
                            {strings.changeMethodEmailLinkDescription}
                        </Description>
                    </>
                ) : (
                    <ListView
                        layout="block"
                    >
                        <NonFieldError
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
                    </ListView>
                )}
            </ListView>
        </Modal>
    );
}

export default ChangePasswordModal;
