import {
    useCallback,
    useContext,
} from 'react';
import {
    useNavigate,
    generatePath,
} from 'react-router-dom';
import {
    useForm,
    type ObjectSchema,
    requiredStringCondition,
    emailCondition,
    getErrorObject,
    type PartialForm,
    createSubmitHandler,
    undefinedValue,
    addCondition,
} from '@togglecorp/toggle-form';
import { isDefined, isValidEmail } from '@togglecorp/fujs';

import { transformObjectError } from '#utils/restRequest/error';
import RouteContext from '#contexts/route';
import Page from '#components/Page';
import TextInput from '#components/TextInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import Link from '#components/Link';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { resolveToComponent } from '#utils/translation';
import { isWhitelistedEmail } from '#utils/common';
import {
    useRequest,
    useLazyRequest,
    type GoApiResponse,
    type GoApiBody,
} from '#utils/restRequest';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety, { NationalSociety } from '#hooks/domain/useNationalSociety';
import CountrySelectInput from '#components/domain/CountrySelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type OrganizationTypeOption = NonNullable<GlobalEnumsResponse['api_profile_org_types']>[number];

type RegisterRequestBody = GoApiBody<'/register', 'POST'>;
type WhiteListResponse = GoApiResponse<'/api/v2/domainwhitelist/'>;

type FormFields = PartialForm<RegisterRequestBody & { confirm_password: string }>;

type FormSchema = ObjectSchema<FormFields, FormFields, { whitelistedDomains: WhiteListResponse['results'] }>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const nsLabelSelector = (item: NationalSociety) => item.society_name;
const defaultFormValue: FormFields = {};
const keySelector = (item: OrganizationTypeOption) => item.key;
const labelSelector = (item: OrganizationTypeOption) => item.value;

const formSchema: FormSchema = {
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

    fields: (value, _, context): FormSchemaFields => {
        let fields: FormSchemaFields = {
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
        };
        fields = addCondition(
            fields,
            value,
            ['email'],
            ['justification'],
            (safeValue) => {
                const isValidIfrcEmail = isDefined(safeValue)
                    && isDefined(safeValue.email)
                    && isValidEmail(safeValue.email)
                    && context.whitelistedDomains
                    && isWhitelistedEmail(safeValue.email, context.whitelistedDomains);
                return isValidIfrcEmail
                    ? {
                        justification: {
                            forceValue: undefinedValue,
                        },
                    }
                    : {
                        justification: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                    };
            },
        );
        return fields;
    },
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { api_profile_org_types: organizationTypes } = useGlobalEnums();
    const { login: loginRoute } = useContext(RouteContext);

    const { response: whiteListDomainResponse } = useRequest({
        url: '/api/v2/domainwhitelist/',
        query: { limit: 9999 },
    });

    const whitelistedDomains = whiteListDomainResponse?.results;

    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(
        formSchema,
        { value: defaultFormValue },
        { whitelistedDomains },
    );

    const alert = useAlert();
    const navigate = useNavigate();

    const fieldError = getErrorObject(formError);
    const isNationalSociety = formValue.organization_type === 'NTLS';

    const {
        pending: registerPending,
        trigger: register,
    } = useLazyRequest({
        method: 'POST',
        url: '/register',
        body: (body: RegisterRequestBody) => body,
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

            setError(transformObjectError(formErrors, () => undefined));

            const message = strings.registrationFailure;
            alert.show(
                message,
                { variant: 'danger' },
            );
        },
    });

    const nationalSocietyOptions = useNationalSociety();

    const isValidIfrcEmail = isDefined(formValue.email)
        && isValidEmail(formValue.email)
        && whitelistedDomains
        && isWhitelistedEmail(formValue.email, whitelistedDomains);

    const handleRegister = useCallback((formValues: FormFields) => {
        register(formValues as RegisterRequestBody);
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
                    className={styles.fullSizeInput}
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
                <CountrySelectInput
                    label={strings.registerCountry}
                    name="country"
                    value={formValue?.country}
                    onChange={setFieldValue}
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
                    options={organizationTypes}
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
                {!isValidIfrcEmail && (
                    <>
                        <div className={styles.justifyNote}>
                            {strings.registerJustify}
                        </div>
                        <TextArea
                            className={styles.fullSizeInput}
                            name="justification"
                            labelClassName={styles.textLabel}
                            label={strings.registerJustification}
                            value={formValue.justification}
                            onChange={setFieldValue}
                            rows={5}
                        />
                    </>
                )}
            </div>
            <div className={styles.actions}>
                <Button
                    name={undefined}
                    onClick={handleFormSubmit}
                    disabled={registerPending}
                >
                    {!isValidIfrcEmail
                        ? strings.requestAccess
                        : strings.registerSubmit}
                </Button>
                <div className={styles.login}>
                    {loginInfo}
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'Register';
