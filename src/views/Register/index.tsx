import {
    useCallback,
    useMemo,
    useContext,
} from 'react';
import {
    useNavigate,
    generatePath,
} from 'react-router-dom';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    emailCondition,
    getErrorObject,
    PartialForm,
    createSubmitHandler,
    undefinedValue,
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
import type { paths, components } from '#generated/types';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OrganizationType = components['schemas']['OrgTypeEnum'];
interface OrganizationOptionType {
    value: OrganizationType;
    label: string;
}

type PostRegister = paths['/register']['post'];
type RegisterResponse = PostRegister['responses']['200']['content']['application/json'];

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];

const nsLabelSelector = (item: NonNullable<CountryResponse['results']>[number]) => item.society_name ?? '';

type FormFields = PartialForm<RegisterResponse & { confirm_password: string }>;
const defaultFormValue: FormFields = {};
const keySelector = (item: OrganizationOptionType) => item.value;
const labelSelector = (item: OrganizationOptionType) => item.label;

const countryKeySelector = (item: NonNullable<CountryResponse['results']>[number]) => item.id;
const countryLabelSelector = (item: NonNullable<CountryResponse['results']>[number]) => item.name ?? '';

// FIXME: Need to make an Api for these options
const organizationTypeOptions: OrganizationOptionType[] = [
    { value: 'NTLS', label: 'National Society' },
    { value: 'DLGN', label: 'IFRC' },
    { value: 'SCRT', label: 'ICRC' },
    { value: 'ICRC', label: 'Other' },
];

type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const formSchema: ObjectSchema<FormFields> = {
    validation: (value) => {
        if (
            value?.password
            && value?.confirm_password
            && value.password !== value.confirm_password
        ) {
            // FIXME: use translations
            return 'Passwords do not match!';
        }
        return undefined;
    },

    fields: (): FormSchemaFields => ({
        first_name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        last_name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
            validations: [emailCondition],
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        confirm_password: {
            required: true,
            requiredValidation: requiredStringCondition,
            forceValue: undefinedValue,
        },
        organization: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        organization_type: {
            required: true,
        },
        country: {
            required: true,
        },
        city: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        department: {},
        position: {},
        phone_number: {},
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
    const isNationalSociety = formValue.organization_type === 'NTLS';

    const {
        pending: registerPending,
        trigger: register,
    } = useLazyRequest<RegisterResponse, FormFields>({
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

    const { response: countriesResponse } = useRequest<CountryResponse>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const countryList = useMemo(
        () => countriesResponse?.results?.filter(isValidCountry),
        [countriesResponse],
    );

    const nationalSocietyOptions = useMemo(
        () => countriesResponse?.results?.filter(isValidNationalSociety),
        [countriesResponse?.results],
    );

    const handleRegister = useCallback((formValues: PartialForm<FormFields>) => {
        register(formValues as FormFields);
    }, [register]);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleRegister);

    const handleOrganizationTypeChange = useCallback(
        (val: string | undefined) => {
            setFieldValue(undefined, 'organization');
            setFieldValue(val, 'organization_type');
        },
        [setFieldValue],
    );

    const loginInfo = resolveToComponent(
        strings.registerAccountPresent,
        {
            loginLink: (
                <Link
                    to={loginRoute.absolutePath}
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
                    className={styles.nonFieldError}
                    error={formError}
                />
                <TextInput
                    name="first_name"
                    label={strings.registerFirstName}
                    value={formValue.first_name}
                    onChange={setFieldValue}
                    error={fieldError?.first_name}
                    disabled={registerPending}
                    withAsterisk
                />
                <TextInput
                    name="last_name"
                    label={strings.registerLastName}
                    value={formValue.last_name}
                    onChange={setFieldValue}
                    error={fieldError?.last_name}
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
                    name="confirm_password"
                    type="password"
                    label={strings.registerConfirmPassword}
                    value={formValue.confirm_password}
                    onChange={setFieldValue}
                    error={fieldError?.confirm_password}
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
                    name="organization_type"
                    value={formValue.organization_type}
                    onChange={handleOrganizationTypeChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={organizationTypeOptions}
                    error={fieldError?.organization_type}
                    disabled={registerPending}
                    withAsterisk
                />
                {isNationalSociety ? (
                    <SelectInput
                        label={strings.registerOrganizationName}
                        name="organization"
                        options={nationalSocietyOptions}
                        keySelector={nsLabelSelector}
                        labelSelector={nsLabelSelector}
                        value={formValue.organization}
                        onChange={setFieldValue}
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
                    name="phone_number"
                    label={strings.registerPhoneNumber}
                    value={formValue.phone_number}
                    onChange={setFieldValue}
                    error={fieldError?.phone_number}
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
