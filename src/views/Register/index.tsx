import {
    useCallback,
    useMemo,
    useContext,
} from 'react';
import {
    useNavigate,
    generatePath,
} from 'react-router-dom';
import { isTruthyString } from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    emailCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import RouteContext from '#contexts/route';
import Page from '#components/Page';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { resolveToComponent } from '#utils/translation';
import {
    isValidCountry,
    isValidNationalSociety,
} from '#utils/common';
import type { GET } from '#types/serverResponse';
import { LabelValue } from '#types/common';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';

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

const nsLabelSelector = (item: LabelValue) => item.label;

type FormFields = PartialForm<Omit<GET['register'], 'id' | 'token' | 'expires'>>;

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
        },
        country: {
            required: true,
        },
        city: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        department: {},
        position: {},
        phone: {},
    }),
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { login: loginRoute } = useContext(RouteContext);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const alert = useAlert();
    const navigate = useNavigate();

    const fieldError = getErrorObject(formError);
    const isNationalSociety = formValue.organizationType === 'NTLS';

    const {
        pending: registerPending,
        trigger: register,
    } = useLazyRequest<GET['register'], FormFields>({
        method: 'POST',
        url: 'register',
        body: (body) => body,
        onSuccess: () => {
            const message = strings.registrationSuccess;
            alert.show(
                message,
                { variant: 'success' },
            );
            navigate(generatePath(loginRoute.absolutePath));
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;
            setError(formErrors);
            // FIXME: Error message from server is not properly sent
            const message = strings.registrationFailure;
            alert.show(
                message,
                { variant: 'danger' },
            );
        },
    });

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

    const handleRegister = useCallback((formValues: PartialForm<FormFields>) => {
        register(formValues as FormFields);
    }, [register]);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleRegister);

    const handleOrganizationNameChange = useCallback(
        (val: string | undefined) => {
            setFieldValue(undefined, 'organization');
            setFieldValue(val, 'organizationType');
        },
        [setFieldValue],
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

    return (
        <Page
            className={styles.register}
            title={strings.registerTitle}
            heading={strings.registerHeader}
            description={strings.registerSubHeader}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.form}>
                <NonFieldError
                    className={styles.serverError}
                    error={formError}
                />
                <TextInput
                    name="firstname"
                    label={strings.registerFirstName}
                    value={formValue.firstname}
                    onChange={setFieldValue}
                    error={fieldError?.firstname}
                    disabled={registerPending}
                    withAsterisk
                />
                <TextInput
                    name="lastname"
                    label={strings.registerLastName}
                    value={formValue.lastname}
                    onChange={setFieldValue}
                    error={fieldError?.lastname}
                    disabled={registerPending}
                    withAsterisk
                />
                <TextInput
                    className={styles.emailInput}
                    name="email"
                    label={strings.registerEmail}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    disabled={registerPending}
                    withAsterisk
                />
                <TextInput
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
                    name="confirmPassword"
                    type="password"
                    label={strings.registerConfirmPassword}
                    value={formValue.confirmPassword}
                    onChange={setFieldValue}
                    error={fieldError?.confirmPassword}
                    disabled={registerPending}
                    withAsterisk
                />
                <div className={styles.formBorder} />
                <SelectInput
                    label={strings.registerCountry}
                    name="country"
                    value={formValue?.country}
                    onChange={setFieldValue}
                    keySelector={countryKeySelector}
                    labelSelector={countryLabelSelector}
                    options={countryList}
                    error={fieldError?.country}
                    disabled={registerPending}
                    withAsterisk
                />
                <TextInput
                    name="city"
                    label={strings.registerCity}
                    value={formValue.city}
                    onChange={setFieldValue}
                    error={fieldError?.city}
                    disabled={registerPending}
                    withAsterisk
                />
                <SelectInput
                    label={strings.registerOrganizationType}
                    name="organizationType"
                    value={formValue.organizationType}
                    onChange={handleOrganizationNameChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={organizationTypeOptions}
                    error={fieldError?.organizationType}
                    disabled={registerPending}
                    withAsterisk
                />
                {isNationalSociety ? (
                    <SelectInput
                        label={strings.registerOrganizationName}
                        name="organization"
                        value={formValue.organization}
                        onChange={setFieldValue}
                        keySelector={nsLabelSelector}
                        labelSelector={nsLabelSelector}
                        options={nationalSocietyOptions}
                        error={fieldError?.organization}
                        disabled={registerPending}
                        withAsterisk
                    />
                ) : (
                    <TextInput
                        name="organization"
                        label={strings.registerOrganizationName}
                        value={formValue.organization}
                        onChange={setFieldValue}
                        error={fieldError?.organization}
                        disabled={registerPending}
                        withAsterisk
                    />
                )}
                <TextInput
                    name="department"
                    label={strings.registerDepartment}
                    value={formValue.department}
                    onChange={setFieldValue}
                    error={fieldError?.department}
                    disabled={registerPending}
                />
                <TextInput
                    name="position"
                    label={strings.registerPosition}
                    value={formValue.position}
                    onChange={setFieldValue}
                    error={fieldError?.position}
                    disabled={registerPending}
                />
                <TextInput
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
                    onClick={handleFormSubmit}
                    disabled={registerPending}
                >
                    {strings.registerSubmit}
                </Button>
                <div className={styles.login}>
                    {loginInfo}
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'Register';
