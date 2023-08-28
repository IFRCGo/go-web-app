import {
    useCallback,
    useContext,
} from 'react';
import {
    useForm,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
    useFormObject,
    type ObjectSchema,
    type PartialForm,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';
import SelectInput from '#components/SelectInput';
import UserContext from '#contexts/user';
import DomainContext from '#contexts/domain';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';
import { stringValueSelector } from '#utils/selectors';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety, { type NationalSociety } from '#hooks/domain/useNationalSociety';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type OrganizationTypeOption = {
    key: NonNullable<GlobalEnumsResponse['api_profile_org_types']>[number]['key'] | '';
    value: string;
}

type UserMeResponse = GoApiResponse<'/api/v2/user/me/'>;

type AccountRequestBody = GoApiBody<'/api/v2/user/{id}/', 'PUT'>;

type PartialFormFields = PartialForm<AccountRequestBody>;

type FormSchema = ObjectSchema<PartialFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

type ProfileSchema = ObjectSchema<PartialFormFields['profile']>;
type ProfileSchemaFields = ReturnType<ProfileSchema['fields']>

const organizationTypeKeySelector = (item: OrganizationTypeOption) => item.key;
const nsLabelSelector = (item: NationalSociety) => item.society_name;

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
                org: {},
                org_type: {},
                city: {},
                department: {},
                position: {},
                phone_number: {},
            }),
        },
    }),
};

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
            org_type: userDetails?.profile?.org_type === ''
                ? undefined : userDetails?.profile?.org_type,
            org: userDetails?.profile?.org,
            department: userDetails?.profile?.department,
            phone_number: userDetails?.profile?.phone_number,
        },
    };

    const strings = useTranslation(i18n);
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

    const alert = useAlert();

    const setProfileFieldValue = useFormObject<'profile', NonNullable<PartialFormFields['profile']>>(
        'profile' as const,
        setFieldValue,
        {},
    );

    const fieldError = getErrorObject(formError);

    const isNationalSociety = formValue.profile?.org_type === 'NTLS';

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
                strings.editAccoutSuccessfulMessage,
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

    const handleConfirmProfileEdit = useCallback((formValues: PartialFormFields) => {
        updateAccountInfo(formValues as AccountRequestBody);
    }, [updateAccountInfo]);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleConfirmProfileEdit);

    const handleOrganizationNameChange = useCallback(
        (val: OrganizationTypeOption['key'] | undefined) => {
            setProfileFieldValue(undefined, 'org');
            setProfileFieldValue(val, 'org_type');
        },
        [setProfileFieldValue],
    );

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
            bodyClassName={styles.content}
        >
            <NonFieldError
                className={styles.nonFieldError}
                error={formError}
            />
            <TextInput
                name="first_name"
                label={strings.firstNameInputLabel}
                value={formValue.first_name}
                onChange={setFieldValue}
                error={fieldError?.first_name}
            />
            <TextInput
                name="last_name"
                label={strings.lastNameInputLabel}
                value={formValue.last_name}
                onChange={setFieldValue}
                error={fieldError?.last_name}
            />
            <TextInput
                name="city"
                label={strings.cityInputLabel}
                value={formValue?.profile?.city}
                onChange={setProfileFieldValue}
                error={profileError?.city}
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
                    error={profileError?.org}
                />
            ) : (
                <TextInput
                    name="org"
                    label={strings.organizationNameInputLabel}
                    value={formValue?.profile?.org}
                    onChange={setProfileFieldValue}
                    error={profileError?.org}
                />
            )}
            <TextInput
                name="department"
                label={strings.departmentInputLabel}
                value={formValue?.profile?.department}
                onChange={setProfileFieldValue}
                error={profileError?.department}
            />
            <TextInput
                name="phone_number"
                label={strings.phoneNumberInputLabel}
                value={formValue?.profile?.phone_number}
                onChange={setProfileFieldValue}
                error={profileError?.phone_number}
            />
        </Modal>
    );
}

export default EditAccountInfo;
