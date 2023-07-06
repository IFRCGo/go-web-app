import { useMemo, useCallback } from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    emailCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import { isTruthyString } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import NonFieldError from '#components/NonFieldError';
import SelectInput from '#components/SelectInput';

import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
} from '#utils/restRequest';
import {
    isValidCountry,
    isValidNationalSociety,
} from '#utils/common';
import { LabelValue } from '#types/common';
import type { GET } from '#types/serverResponse';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: Dummy type for organization
type NationalSocietiesList = 'NTLS' | 'DLGN' | 'SCRT' | 'ICRC' | 'OTHR';
interface OptionType {
    value: NationalSocietiesList;
    label: string;
}

interface CountryOptionType {
    id: number;
    name: string;
}

interface UserEditProfile {
    id: number;
    token: string;
    expires: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
    organization: string;
    country: number;
    organizationType: string;
    city: string;
    department: string;
    position: string;
    phone: string;
}

const nsLabelSelector = (item: LabelValue) => item.label;

type FormFields = PartialForm<Omit<UserEditProfile, 'id' | 'token' | 'expires'>>;

const defaultFormValue: FormFields = {};

const keySelector = (item: OptionType) => item.value;
const labelSelector = (item: OptionType) => item.label;

const countryKeySelector = (item: CountryOptionType) => item.id;
const countryLabelSelector = (item: CountryOptionType) => item.name;

// FIXME: Need to make an Api for these options
const organizationTypeOptions: OptionType[] = [
    { value: 'NTLS', label: 'National Society' },
    { value: 'DLGN', label: 'IFRC' },
    { value: 'SCRT', label: 'ICRC' },
    { value: 'ICRC', label: 'Other' },
];

const formSchema: ObjectSchema<FormFields> = {
    validation: (value) => {
        if (
            value?.password
            && value?.confirmPassword
            && value.password !== value.confirmPassword
        ) {
            return 'Passwords do not match!';
        }
        return undefined;
    },
    fields: () => ({
        firstname: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        lastname: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        email: {
            required: true,
            requiredCondition: emailCondition,
        },
        organization: {},
        organizationType: {},
        country: {},
        city: {},
        department: {},
        position: {},
        phone: {},
    }),
};

interface Props {
    handleCancelButton?: () => void;
}

function EditAccountInfo(props: Props) {
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
    const isNationalSociety = formValue.organizationType === 'NTLS';

    const { response: countriesResponse } = useRequest<GET['api/v2/country']>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const countryList = useMemo(
        () => countriesResponse?.results.filter(
            (country) => isValidCountry(country) && isTruthyString(country.name),
        ),
        [countriesResponse],
    );

    const nationalSocietyOptions = useMemo(
        () => (
            countriesResponse?.results.filter(isValidNationalSociety).map(
                (country) => ({ value: country.id, label: country.society_name }),
            )
        ),
        [countriesResponse?.results],
    );

    // FIXME: Add the api for profile EDIT
    const handleConfirmProfileEdit = useCallback(() => {
        // eslint-disable-next-line no-console
        console.log('Add api for profile edit::::');
    }, []);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleConfirmProfileEdit);

    const handleOrganizationNameChange = useCallback(
        (val: string | undefined) => {
            setFieldValue(undefined, 'organization');
            setFieldValue(val, 'organizationType');
        },
        [setFieldValue],
    );

    return (
        <Modal
            heading={strings.editUserProfile}
            headingLevel={3}
            onClose={handleCancelButton}
            hideCloseButton
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                    >
                        Confirm
                    </Button>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleCancelButton}
                    >
                        Cancel
                    </Button>
                </>
            )}
        >
            <div className={styles.editProfileModal}>
                <NonFieldError
                    className={styles.serverError}
                    error={formError}
                />
                <TextInput
                    name="firstname"
                    label={strings.firstname}
                    value={formValue.firstname}
                    onChange={setFieldValue}
                    error={fieldError?.firstname}
                    withAsterisk
                />
                <TextInput
                    name="lastname"
                    label={strings.lastname}
                    value={formValue.lastname}
                    onChange={setFieldValue}
                    error={fieldError?.lastname}
                    withAsterisk
                />
                <TextInput
                    className={styles.emailInput}
                    name="email"
                    label={strings.email}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    withAsterisk
                />
                <div className={styles.formBorder} />
                <SelectInput
                    label={strings.country}
                    name="country"
                    value={formValue?.country}
                    onChange={setFieldValue}
                    keySelector={countryKeySelector}
                    labelSelector={countryLabelSelector}
                    options={countryList}
                    error={fieldError?.country}
                    withAsterisk
                />
                <TextInput
                    name="city"
                    label={strings.city}
                    value={formValue.city}
                    onChange={setFieldValue}
                    error={fieldError?.city}
                    withAsterisk
                />
                <SelectInput
                    label={strings.organizationType}
                    name="organizationType"
                    value={formValue.organizationType}
                    onChange={handleOrganizationNameChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={organizationTypeOptions}
                    error={fieldError?.organizationType}
                    withAsterisk
                />
                {isNationalSociety ? (
                    <SelectInput
                        label={strings.organizationName}
                        name="organization"
                        value={formValue.organization}
                        onChange={setFieldValue}
                        keySelector={nsLabelSelector}
                        labelSelector={nsLabelSelector}
                        options={nationalSocietyOptions}
                        error={fieldError?.organization}
                        withAsterisk
                    />
                ) : (
                    <TextInput
                        name="organization"
                        label={strings.organizationName}
                        value={formValue.organization}
                        onChange={setFieldValue}
                        error={fieldError?.organization}
                        withAsterisk
                    />
                )}
                <TextInput
                    name="department"
                    label={strings.department}
                    value={formValue.department}
                    onChange={setFieldValue}
                    error={fieldError?.department}
                />
                <TextInput
                    name="phone"
                    label={strings.phoneNumber}
                    value={formValue.phone}
                    onChange={setFieldValue}
                    error={fieldError?.phone}
                    withAsterisk
                />
            </div>
        </Modal>
    );
}

export default EditAccountInfo;
