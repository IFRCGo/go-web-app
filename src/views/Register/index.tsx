import { useState, useCallback } from 'react';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';

import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { useLazyRequest } from '#utils/restRequest';

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
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
    city: string;
    department: string;
    position: string;
    phone: string;
}

interface FormFields {
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    email?: string | null | undefined;
    password?: string | null | undefined;
    confirmPassword?: string | null | undefined;
    organizationName?: string | null | undefined;
    city?: string | null | undefined;
    department?: string | null | undefined;
    position?: string | null | undefined;
    phone?: string | null | undefined;
}

const defaultFormValue: PartialForm<FormFields> = {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    confirmPassword: undefined,
    organizationName: undefined,
    city: undefined,
    department: undefined,
    position: undefined,
    phone: undefined
};

const formSchema: ObjectSchema<FormFields> = {
    fields: () => ({
        firstName: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        lastName: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        email: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        password: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        confirmPassword: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        organizationName: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        city: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        department: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        position: {
            required: true,
            requiredCondition: requiredStringCondition,
        },
        phone: {
            required: true,
            requiredCondition: requiredStringCondition,
        },

    }),
};

// FIXME: Replace this dummy option with the original one
const countryOptions: OptionType[] = [
    { value: '01', label: 'Nepal' },
    { value: '02', label: 'Bangkok' },
    { value: '03', label: 'Bhutan' },
    { value: '04', label: 'China' },
    { value: '05', label: 'Pakistan' },
];

// FIXME: Replace this dummy option with the original one
const organizationTypeOptions: OptionType[] = [
    { value: '001', label: 'National Society' },
    { value: '002', label: 'IFRC' },
    { value: '003', label: 'ICRC' },
    { value: '004', label: 'Other' },
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const [countryType, setCountryType] = useState<string | undefined>(undefined);
    const [organizationType, setOrganizationType] = useState<string | undefined>(undefined);

    const {
        trigger: login,
    } = useLazyRequest<ResponseFields, FormFields>({
        method: 'POST',
        url: 'get_auth_token',
        body: (body) => body,
        onSuccess: (response) => {
            console.log('REquest call for register::::?>>', response);
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(formErrors);
        },
    });

    const fieldError = getErrorObject(formError);
    const loginInfo = resolveToComponent(
        strings.registerAccountPresent,
        {
            loginLink: (
                <Link
                    to="register"
                    underline
                >
                    {strings.registerLogin}
                </Link>
            ),
        },
    );

    const handleRegister = useCallback(() => {
        const result = validate();

        if (result.errored) {
            setError(result.error);
            return;
        }

        const body = result.value;
        login(body);
    }, [
        validate,
        setError,
        login,
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
                        name="firstName"
                        label={strings.registerFirstName}
                        value={formValue.firstName}
                        onChange={setFieldValue}
                        error={fieldError?.firstName}
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="lastName"
                        label={strings.registerLastName}
                        value={formValue.lastName}
                        onChange={setFieldValue}
                        error={fieldError?.lastName}
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
                        withAsterisk
                    />
                </div>
                <div className={styles.formBorder} />
                <div className={styles.fields}>
                    <SelectInput
                        label={strings.registerCountry}
                        name="country"
                        value={countryType}
                        onChange={setCountryType}
                        // FIXME: do no inline functions on render
                        keySelector={(item) => item.value}
                        labelSelector={(item) => item.label}
                        options={countryOptions}
                    />
                    <TextInput
                        className={styles.inputField}
                        name="city"
                        label={strings.registerCity}
                        value={formValue.city}
                        onChange={setFieldValue}
                        error={fieldError?.city}
                        withAsterisk
                    />
                </div>
                <TextInput
                    className={styles.inputField}
                    name="organizationName"
                    label={strings.registerOrganizationName}
                    value={formValue.organizationName}
                    onChange={setFieldValue}
                    error={fieldError?.organizationName}
                    withAsterisk
                />
                <div className={styles.fields}>
                    <SelectInput
                        label={strings.registerOrganizationType}
                        name="organizationType"
                        value={organizationType}
                        onChange={setOrganizationType}
                        // FIXME: do no inline functions on render
                        keySelector={(item) => item.value}
                        labelSelector={(item) => item.label}
                        options={organizationTypeOptions}
                    />
                    <TextInput
                        className={styles.inputField}
                        name="department"
                        label={strings.registerDepartment}
                        value={formValue.department}
                        onChange={setFieldValue}
                        error={fieldError?.department}
                        withAsterisk
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
                        withAsterisk
                    />
                    <TextInput
                        className={styles.inputField}
                        name="phone"
                        label={strings.registerPhoneNumber}
                        value={formValue.phone}
                        onChange={setFieldValue}
                        error={fieldError?.phone}
                        withAsterisk
                    />
                </div>
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        onClick={handleRegister}
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
