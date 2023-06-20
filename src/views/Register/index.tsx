import {
    useState,
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    requiredCondition,
    getErrorObject,
    PartialForm,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { resolveToComponent } from '#utils/translation';
import { isValidCountry } from '#utils/common';
import type { Country } from '#types/country';
import {
    ListResponse,
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: Dummy type for country
interface OptionType {
    value: string;
    label: string;
}

interface ResponseFields {
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

type FormFields = PartialForm<Omit<ResponseFields, 'id' | 'token' | 'expires'>>;

const defaultFormValue: FormFields = {};

const formSchema: ObjectSchema<FormFields> = {
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
            requiredCondition,
        },
        password: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        confirmPassword: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        organization: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        organizationType: {
            required: true,
            requiredCondition,
        },
        country: {
            required: true,
            requiredCondition,
        },
        city: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        department: {
            required: false,
        },
        position: {
            required: false,
        },
        phone: {
            required: false,
        },

    }),
};

const keySelector = (item: OptionType) => item.value;
const labelSelector = (item: OptionType) => item.label;

function countryKeySelector(country: Country) {
    return country.id;
}

function countryNameSelector(country: Country) {
    return country.name;
}

// FIXME: Need to make an Api for these options
const organizationTypeOptions: OptionType[] = [
    { value: '12', label: 'National Society' },
    { value: '13', label: 'IFRC' },
    { value: '14', label: 'ICRC' },
    { value: '15', label: 'Other' },
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const alert = useAlert();
    const navigate = useNavigate();

    const [countryName, setCountryName] = useState<number | undefined>(undefined);
    const [organizationType, setOrganizationType] = useState<string | undefined>(undefined);

    const fieldError = getErrorObject(formError);

    const {
        pending: registerPending,
        trigger: register,
    } = useLazyRequest<ResponseFields, FormFields>({
        method: 'POST',
        url: 'register',
        body: (body) => body,
        onSuccess: () => {
            const message = 'Successfully created a user !';
            alert.show(
                message,
                { variant: 'success' },
            );
            navigate('/login');
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;
            setError(formErrors);
            // FIXME: Error message from server is not properly sent
            const message = 'Sorry could not register new user right now !';
            alert.show(
                message,
                { variant: 'danger' },
            );
        },
    });

    const { response: countriesResponse } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const countryList = useMemo(
        () => countriesResponse?.results.filter(
            (country) => isValidCountry(country) && !!country.name,
        ),
        [countriesResponse],
    );
    const loginInfo = resolveToComponent(
        strings.registerAccountPresent,
        {
            loginLink: (
                <Link
                    to="register"
                    withUnderline
                >
                    {strings.registerLogin}
                </Link>
            ),
        },
    );

    const handleCountrySelect = useCallback((countrySelected: number | undefined) => {
        setCountryName(countrySelected);
        setValue({
            ...formValue,
            country: countrySelected,
        });
    }, [formValue, setValue]);

    const handleOrganizationType = useCallback((org: string | undefined) => {
        setOrganizationType(org);
        setValue({
            ...formValue,
            organizationType: org,
        });
    }, [formValue, setValue]);

    const handleRegister = useCallback(() => {
        const result = validate();

        if (result.errored) {
            setError(result.error);
            return;
        }

        const body = result.value;
        register(body);
    }, [
        validate,
        setError,
        register,
    ]);

    return (
        <Page
            className={styles.register}
            title={strings.registerTitle}
            heading={strings.registerHeader}
            description={strings.registerSubHeader}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.form}>
                <NonFieldError error={formError} />
                <div className={styles.fields}>
                    <TextInput
                        className={styles.inputField}
                        name="firstname"
                        label={strings.registerFirstName}
                        value={formValue.firstname}
                        onChange={setFieldValue}
                        error={fieldError?.firstname}
                        disabled={registerPending}
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="lastname"
                        label={strings.registerLastName}
                        value={formValue.lastname}
                        onChange={setFieldValue}
                        error={fieldError?.lastname}
                        disabled={registerPending}
                        withAsterisk
                    />
                </div>
                <TextInput
                    className={styles.inputField}
                    name="email"
                    label={strings.registerEmail}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    disabled={registerPending}
                    withAsterisk
                />
                <div className={styles.fields}>
                    <TextInput
                        className={styles.inputField}
                        name="password"
                        type="password"
                        label={strings.registerPassword}
                        value={formValue.password}
                        onChange={setFieldValue}
                        error={fieldError?.password}
                        disabled={registerPending}
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="confirmPassword"
                        type="password"
                        label={strings.registerConfirmPassword}
                        value={formValue.confirmPassword}
                        onChange={setFieldValue}
                        error={fieldError?.confirmPassword}
                        disabled={registerPending}
                        withAsterisk
                    />
                </div>
                <div className={styles.formBorder} />
                <div className={styles.fields}>
                    <SelectInput
                        className={styles.inputField}
                        label={strings.registerCountry}
                        name="country"
                        value={countryName}
                        onChange={handleCountrySelect}
                        keySelector={countryKeySelector}
                        labelSelector={countryNameSelector}
                        options={countryList}
                        error={fieldError?.country}
                        disabled={registerPending}
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="city"
                        label={strings.registerCity}
                        value={formValue.city}
                        onChange={setFieldValue}
                        error={fieldError?.city}
                        disabled={registerPending}
                        withAsterisk
                    />
                </div>
                <TextInput
                    className={styles.inputField}
                    name="organization"
                    label={strings.registerOrganizationName}
                    value={formValue.organization}
                    onChange={setFieldValue}
                    error={fieldError?.organization}
                    disabled={registerPending}
                    withAsterisk
                />
                <div className={styles.fields}>
                    <SelectInput
                        className={styles.inputField}
                        label={strings.registerOrganizationType}
                        name="organizationType"
                        value={organizationType}
                        onChange={handleOrganizationType}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        options={organizationTypeOptions}
                        error={fieldError?.organizationType}
                        disabled={registerPending}
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="department"
                        label={strings.registerDepartment}
                        value={formValue.department}
                        onChange={setFieldValue}
                        error={fieldError?.department}
                        disabled={registerPending}
                    />
                </div>
                <div className={styles.fields}>
                    <TextInput
                        className={styles.inputField}
                        name="position"
                        label={strings.registerPosition}
                        value={formValue.position}
                        onChange={setFieldValue}
                        error={fieldError?.position}
                        disabled={registerPending}
                    />
                    <TextInput
                        className={styles.inputField}
                        name="phone"
                        label={strings.registerPhoneNumber}
                        value={formValue.phone}
                        onChange={setFieldValue}
                        error={fieldError?.phone}
                        disabled={registerPending}
                        withAsterisk
                    />
                </div>
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        onClick={handleRegister}
                        disabled={registerPending}
                    >
                        {strings.registerSubmit}
                    </Button>
                    <div className={styles.login}>
                        {loginInfo}
                    </div>
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'Register';
