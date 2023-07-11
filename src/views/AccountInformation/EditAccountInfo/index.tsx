import {
    useMemo,
    useCallback,
    useContext,
} from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    emailCondition,
    getErrorObject,
    getErrorString,
    PartialForm,
    createSubmitHandler,
    useFormObject,
} from '@togglecorp/toggle-form';
import { isTruthyString, isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';
import SelectInput from '#components/SelectInput';
import UserContext from '#contexts/user';

import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import {
    isValidCountry,
    isValidNationalSociety,
} from '#utils/common';
import type { paths, components } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OrganizationType = components['schemas']['OrgTypeEnum'];
interface OrganizationOptionType {
    key: OrganizationType;
    value: string;
}

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];

type GetOrganizationList = paths['/api/v2/global-enums/']['get'];
type OrganizationListResponse = GetOrganizationList['responses']['200']['content']['application/json'];

type PatchAccountInfo = paths['/api/v2/user/{id}/']['patch'];
type AccountEditResponse = PatchAccountInfo['requestBody']['content']['application/json'];

type FormFields = PartialForm<AccountEditResponse>;

const defaultFormValue: FormFields = {};

const nsLabelSelector = (item: { label: string }) => item.label;

const keySelector = (item: OrganizationOptionType) => item.key;
const labelSelector = (item: OrganizationOptionType) => item.value;

const countryKeySelector = (item: NonNullable<CountryResponse['results']>[number]) => item.id;
const countryLabelSelector = (item: NonNullable<CountryResponse['results']>[number]) => item.name ?? '';

function clearEmptyString<T extends string>(val: T | undefined | ''): T | undefined {
    if (val === '') {
        return undefined;
    }
    return val;
}

type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

type ProfileSchema = ObjectSchema<NonNullable<FormFields['profile']>>;
type ProfileSchemaFields = ReturnType<ProfileSchema['fields']>

const formSchema: ObjectSchema<FormFields> = {
    fields: (): FormSchemaFields => ({
        first_name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        last_name: {
            required: true,
        },
        email: {
            required: true,
            requiredValidation: emailCondition,
        },
        profile: {
            fields: (): ProfileSchemaFields => ({
                country: {},
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
    handleModalCloseButton: () => void;
}

function EditAccountInfo(props: Props) {
    const {
        handleModalCloseButton,
    } = props;

    const strings = useTranslation(i18n);
    const { userAuth: userDetails } = useContext(UserContext);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const alert = useAlert();

    const setProfileFieldValue = useFormObject<'profile', NonNullable<FormFields['profile']>>(
        'profile' as const,
        setFieldValue,
        {},
    );

    const fieldError = getErrorObject(formError);

    const isNationalSociety = formValue.profile?.org_type === 'NTLS';

    const {
        pending: updateAccountPending,
        trigger: updateAccountInfo,
    } = useLazyRequest<AccountEditResponse, FormFields>({
        method: 'PATCH',
        url: `/api/v2/user/${userDetails?.id}/`,
        body: (body) => body,
        onSuccess: () => {
            const message = strings.successfullyEditedAccount;
            alert.show(
                message,
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

            setError(formErrors);
            // FIXME: Error message from server is not properly sent

            const message = strings.editAccountFailure;
            alert.show(
                message,
                { variant: 'danger' },
            );
        },
    });

    const { response: organizationOptionsResponse } = useRequest<OrganizationListResponse>({
        url: 'api/v2/global-enums/',
        query: { limit: 500 },
    });

    const { response: countriesResponse } = useRequest<CountryResponse>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const organizationTypeOptions = organizationOptionsResponse?.api_profile_org_types;

    const countryList = useMemo(
        () => countriesResponse?.results?.filter(
            (country) => isValidCountry(country) && isTruthyString(country.name),
        ),
        [countriesResponse],
    );

    const nationalSocietyOptions = useMemo(
        () => countriesResponse?.results
            ?.filter(isValidNationalSociety).map(
                (country) => (
                    country.society_name
                        ? { label: country.society_name }
                        : undefined
                ),
            ).filter(isDefined),
        [countriesResponse?.results],
    );

    const handleConfirmProfileEdit = useCallback((formValues: PartialForm<FormFields>) => {
        updateAccountInfo(formValues as FormFields);
    }, [updateAccountInfo]);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleConfirmProfileEdit);

    const handleOrganizationNameChange = useCallback(
        (val: OrganizationType | undefined) => {
            setProfileFieldValue(undefined, 'org');
            setProfileFieldValue(val, 'org_type');
        },
        [setProfileFieldValue],
    );

    return (
        <Modal
            className={styles.editAccountInfo}
            heading={strings.editUserProfile}
            headingLevel={3}
            onClose={handleModalCloseButton}
            hideCloseButton
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleModalCloseButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        disabled={updateAccountPending}
                    >
                        Confirm
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
                label={strings.accountFirstName}
                value={formValue.first_name}
                onChange={setFieldValue}
                error={fieldError?.first_name}
            />
            <TextInput
                name="last_name"
                label={strings.accountLastName}
                value={formValue.last_name}
                onChange={setFieldValue}
                error={fieldError?.last_name}
            />
            <SelectInput
                label={strings.accountCountry}
                name="country"
                value={formValue?.profile?.country}
                onChange={setProfileFieldValue}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                options={countryList}
                error={getErrorString(fieldError?.profile)}
            />
            <TextInput
                name="city"
                label={strings.accountCity}
                value={formValue?.profile?.city}
                onChange={setProfileFieldValue}
                error={getErrorString(fieldError?.profile)}
            />
            <SelectInput
                label={strings.accountOrganizationType}
                name="org_type"
                value={clearEmptyString(formValue?.profile?.org_type)}
                onChange={handleOrganizationNameChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={organizationTypeOptions}
                error={getErrorString(fieldError?.profile)}
            />
            {isNationalSociety ? (
                <SelectInput
                    label={strings.accountOrganizationName}
                    name="org"
                    value={formValue?.profile?.org}
                    onChange={setProfileFieldValue}
                    keySelector={nsLabelSelector}
                    labelSelector={nsLabelSelector}
                    options={nationalSocietyOptions}
                    error={getErrorString(fieldError?.profile)}
                />
            ) : (
                <TextInput
                    name="org"
                    label={strings.accountOrganizationName}
                    value={formValue?.profile?.org}
                    onChange={setProfileFieldValue}
                    error={getErrorString(fieldError?.profile)}
                />
            )}
            <TextInput
                name="department"
                label={strings.accountDepartment}
                value={formValue?.profile?.department}
                onChange={setProfileFieldValue}
                error={getErrorString(fieldError?.profile)}
            />
            <TextInput
                name="phone_number"
                label={strings.accountPhoneNumber}
                value={formValue?.profile?.phone_number}
                onChange={setProfileFieldValue}
                error={getErrorString(fieldError?.profile)}
            />
        </Modal>
    );
}

export default EditAccountInfo;
