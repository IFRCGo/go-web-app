import {
    useCallback,
    useContext,
} from 'react';
import {
    Button,
    Modal,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import DomainContext from '#contexts/domain';
import UserContext from '#contexts/user';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety, { type NationalSociety } from '#hooks/domain/useNationalSociety';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

type UserMeResponse = GoApiResponse<'/api/v2/user/me/'>;
type AccountRequestBody = GoApiBody<'/api/v2/user/{id}/', 'PATCH'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type OrganizationTypeOption = {
    key: NonNullable<GlobalEnumsResponse['api_profile_org_types']>[number]['key'];
    value: string;
}

const organizationTypeKeySelector = (item: OrganizationTypeOption) => item.key;
const nsLabelSelector = (item: NationalSociety) => item.society_name;

type PartialFormFields = PartialForm<AccountRequestBody>;

type FormSchema = ObjectSchema<PartialFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

type ProfileSchema = ObjectSchema<PartialFormFields['profile']>;
type ProfileSchemaFields = ReturnType<ProfileSchema['fields']>

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        first_name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        last_name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        profile: {
            fields: (): ProfileSchemaFields => ({
                org: {
                    // FIXME: Server does not accept null as empty value
                    defaultValue: '',
                },
                org_type: {
                    // FIXME: Server does not accept null as empty value
                    defaultValue: '' as never,
                },
                city: {},
                department: {},
                position: {},
                phone_number: {},
            }),
        },
    }),
};

// FIXME: move this to utils
function clearEmptyString<T extends string>(value: T | null | undefined) {
    if (isFalsyString(value)) {
        return undefined;
    }
    return value;
}

interface Props {
    userDetails: UserMeResponse | undefined;
    handleModalCloseButton: () => void;
}

function EditAccountInfo(props: Props) {
    const {
        userDetails,
        handleModalCloseButton,
    } = props;

    const defaultFormValue: PartialFormFields = {
        first_name: userDetails?.first_name,
        last_name: userDetails?.last_name,
        profile: {
            city: userDetails?.profile?.city,
            // FIXME: The server sends empty string as org_type
            org_type: clearEmptyString(userDetails?.profile?.org_type),
            // FIXME: The server sends empty string as org
            org: clearEmptyString(userDetails?.profile?.org),
            department: userDetails?.profile?.department,
            phone_number: userDetails?.profile?.phone_number,
            position: userDetails?.profile.position,
        },
    };

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { userAuth } = useContext(UserContext);
    const { invalidate } = useContext(DomainContext);
    const { api_profile_org_types: organizationTypeOptions } = useGlobalEnums();

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const setProfileFieldValue = useFormObject<'profile', NonNullable<PartialFormFields['profile']>>(
        'profile' as const,
        setFieldValue,
        {},
    );

    const {
        pending: updateAccountPending,
        trigger: updateAccountInfo,
    } = useLazyRequest({
        method: 'PATCH',
        url: '/api/v2/user/{id}/',
        pathVariables: userAuth && isDefined(userAuth.id)
            ? { id: userAuth.id }
            : undefined,
        body: (body: AccountRequestBody) => body,
        onSuccess: () => {
            alert.show(
                strings.editAccountSuccessfulMessage,
                { variant: 'success' },
            );
            invalidate('user-me');
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
                strings.editAccountFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const nationalSocietyOptions = useNationalSociety();

    const handleConfirmProfileEdit = useCallback(
        (formValues: PartialFormFields) => {
            updateAccountInfo(formValues as AccountRequestBody);
        },
        [updateAccountInfo],
    );

    const handleOrganizationNameChange = useCallback(
        (val: OrganizationTypeOption['key'] | undefined) => {
            setProfileFieldValue(val, 'org_type');
            if (val === 'NTLS') {
                setProfileFieldValue(undefined, 'org');
            }
        },
        [setProfileFieldValue],
    );

    const handleFormSubmit = createSubmitHandler(validate, setError, handleConfirmProfileEdit);

    const fieldError = getErrorObject(formError);

    const isNationalSociety = formValue.profile?.org_type === 'NTLS';

    const profileError = getErrorObject(fieldError?.profile);

    return (
        <Modal
            className={styles.editAccountInfo}
            heading={strings.editUserProfileHeading}
            headingLevel={3}
            onClose={handleModalCloseButton}
            withoutCloseButton
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleModalCloseButton}
                    >
                        {strings.editProfileCancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        disabled={updateAccountPending}
                    >
                        {strings.editProfileConfirmButtonLabel}
                    </Button>
                </>
            )}
            childrenContainerClassName={styles.content}
        >
            <NonFieldError
                className={styles.nonFieldError}
                error={formError}
                withFallbackError
            />
            <NonFieldError
                className={styles.nonFieldError}
                error={profileError}
            />
            <TextInput
                name="first_name"
                label={strings.firstNameInputLabel}
                value={formValue.first_name}
                onChange={setFieldValue}
                error={fieldError?.first_name}
                disabled={updateAccountPending}
                withAsterisk
                autoFocus
            />
            <TextInput
                name="last_name"
                label={strings.lastNameInputLabel}
                value={formValue.last_name}
                onChange={setFieldValue}
                error={fieldError?.last_name}
                disabled={updateAccountPending}
                withAsterisk
            />
            <TextInput
                name="city"
                label={strings.cityInputLabel}
                value={formValue?.profile?.city}
                onChange={setProfileFieldValue}
                error={profileError?.city}
                disabled={updateAccountPending}
            />
            <SelectInput
                label={strings.organizationTypeInputLabel}
                name="org_type"
                value={formValue?.profile?.org_type}
                onChange={handleOrganizationNameChange}
                keySelector={organizationTypeKeySelector}
                labelSelector={stringValueSelector}
                options={organizationTypeOptions}
                error={profileError?.org_type}
                disabled={updateAccountPending}
            />
            {isNationalSociety ? (
                <SelectInput
                    label={strings.organizationNameInputLabel}
                    name="org"
                    value={formValue?.profile?.org}
                    onChange={setProfileFieldValue}
                    keySelector={nsLabelSelector}
                    labelSelector={nsLabelSelector}
                    options={nationalSocietyOptions}
                    disabled={updateAccountPending}
                    error={profileError?.org}
                />
            ) : (
                <TextInput
                    name="org"
                    label={strings.organizationNameInputLabel}
                    value={formValue?.profile?.org}
                    onChange={setProfileFieldValue}
                    disabled={updateAccountPending}
                    error={profileError?.org}
                />
            )}
            <TextInput
                name="department"
                label={strings.departmentInputLabel}
                value={formValue?.profile?.department}
                onChange={setProfileFieldValue}
                error={profileError?.department}
                disabled={updateAccountPending}
            />
            <TextInput
                name="phone_number"
                label={strings.phoneNumberInputLabel}
                value={formValue?.profile?.phone_number}
                onChange={setProfileFieldValue}
                error={profileError?.phone_number}
                disabled={updateAccountPending}
            />
            <TextInput
                name="position"
                label={strings.positionInputLabel}
                value={formValue?.profile?.position}
                onChange={setProfileFieldValue}
                error={profileError?.position}
                disabled={updateAccountPending}
            />
        </Modal>
    );
}

export default EditAccountInfo;
