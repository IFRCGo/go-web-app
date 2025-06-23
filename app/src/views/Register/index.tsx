import { useCallback } from 'react';
import {
    Button,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isWhitelistedEmail,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isTruthyString,
    isValidEmail,
} from '@togglecorp/fujs';
import {
    addCondition,
    createSubmitHandler,
    emailCondition,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
    useForm,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import WikiLink from '#components/WikiLink';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety, { type NationalSociety } from '#hooks/domain/useNationalSociety';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegisterRequestBody = GoApiBody<'/register', 'POST'>;
type WhiteListResponse = GoApiResponse<'/api/v2/domainwhitelist/'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type OrganizationTypeOption = NonNullable<GlobalEnumsResponse['api_profile_org_types']>[number];

const nsLabelSelector = (item: NationalSociety) => item.society_name;
const keySelector = (item: OrganizationTypeOption) => item.key;
const labelSelector = (item: OrganizationTypeOption) => item.value;

function getPasswordMatchCondition(referenceVal: string | undefined) {
    function passwordMatchCondition(val: string | undefined) {
        if (isTruthyString(val) && isTruthyString(referenceVal) && val !== referenceVal) {
            return 'Passwords do not match';
        }
        return undefined;
    }

    return passwordMatchCondition;
}

type FormFields = PartialForm<RegisterRequestBody & { confirm_password: string }>;

const defaultFormValue: FormFields = {};

type FormSchema = ObjectSchema<FormFields, FormFields, { whitelistedDomains: WhiteListResponse['results'] | undefined }>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const formSchema: FormSchema = {
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
            department: {
                // FIXME: server does not support null
                defaultValue: undefinedValue,
            },
            position: {
                // FIXME: server does not support null
                defaultValue: undefinedValue,
            },
            phone_number: {
                // FIXME: server does not support null
                defaultValue: undefinedValue,
            },
        };

        fields = addCondition(
            fields,
            value,
            ['password'],
            ['confirm_password'],
            (val) => ({
                confirm_password: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                    forceValue: undefinedValue,
                    validations: [getPasswordMatchCondition(val?.password)],
                },
            }),
        );

        fields = addCondition(
            fields,
            value,
            ['email'],
            ['justification'],
            (safeValue) => {
                const justificationNeeded = (
                    isDefined(safeValue)
                    && isTruthyString(safeValue.email)
                    && isValidEmail(safeValue.email)
                    && context.whitelistedDomains
                    && !isWhitelistedEmail(safeValue.email, context.whitelistedDomains)
                );

                return !justificationNeeded
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

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { api_profile_org_types: organizationTypes } = useGlobalEnums();

    const alert = useAlert();
    const { navigate } = useRouting();

    const {
        response: whiteListDomainResponse,
        pending: whiteListDomainPending,
    } = useRequest({
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
            navigate('login');
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.registrationFailure,
                { variant: 'danger' },
            );
        },
    });

    const handleRegister = useCallback(
        (formValues: FormFields) => {
            register(formValues as RegisterRequestBody);
        },
        [register],
    );

    const handleOrganizationTypeChange = useCallback(
        (val: string | undefined) => {
            setFieldValue(val, 'organization_type');
            if (val === 'NTLS') {
                setFieldValue(undefined, 'organization');
            }
        },
        [setFieldValue],
    );

    const handleFormSubmit = createSubmitHandler(validate, setError, handleRegister);

    const fieldError = getErrorObject(formError);

    const isNationalSociety = formValue.organization_type === 'NTLS';

    const nationalSocietyOptions = useNationalSociety();

    const justificationNeeded = (
        isTruthyString(formValue.email)
        && isValidEmail(formValue.email)
        && whitelistedDomains
        && !isWhitelistedEmail(formValue.email, whitelistedDomains)
    );

    const loginInfo = resolveToComponent(
        strings.registerAccountPresent,
        {
            loginLink: (
                <Link
                    to="login"
                    withUnderline
                >
                    {strings.registerLogin}
                </Link>
            ),
        },
    );

    const pending = whiteListDomainPending || registerPending;

    return (
        <Page
            className={styles.register}
            title={strings.registerTitle}
            heading={strings.registerHeader}
            description={strings.registerSubHeader}
            mainSectionClassName={styles.mainSection}
            actions={(
                <WikiLink
                    href="user_guide/account"
                />
            )}
        >
            <div className={styles.form}>
                <NonFieldError
                    className={styles.nonFieldError}
                    error={formError}
                    withFallbackError
                />
                <TextInput
                    name="first_name"
                    label={strings.registerFirstName}
                    value={formValue.first_name}
                    onChange={setFieldValue}
                    error={fieldError?.first_name}
                    disabled={pending}
                    withAsterisk
                    autoFocus
                />
                <TextInput
                    name="last_name"
                    label={strings.registerLastName}
                    value={formValue.last_name}
                    onChange={setFieldValue}
                    error={fieldError?.last_name}
                    disabled={pending}
                    withAsterisk
                />
                <TextInput
                    className={styles.fullSizeInput}
                    name="email"
                    label={strings.registerEmail}
                    value={formValue.email}
                    onChange={setFieldValue}
                    error={fieldError?.email}
                    disabled={pending}
                    withAsterisk
                />
                <TextInput
                    name="password"
                    type="password"
                    label={strings.registerPassword}
                    value={formValue.password}
                    onChange={setFieldValue}
                    error={fieldError?.password}
                    disabled={pending}
                    withAsterisk
                />
                <TextInput
                    name="confirm_password"
                    type="password"
                    label={strings.registerConfirmPassword}
                    value={formValue.confirm_password}
                    onChange={setFieldValue}
                    error={fieldError?.confirm_password}
                    disabled={pending}
                    withAsterisk
                />
                <div className={styles.formBorder} />
                <CountrySelectInput
                    label={strings.registerCountry}
                    name="country"
                    value={formValue?.country}
                    onChange={setFieldValue}
                    error={fieldError?.country}
                    disabled={pending}
                    withAsterisk
                />
                <TextInput
                    name="city"
                    label={strings.registerCity}
                    value={formValue.city}
                    onChange={setFieldValue}
                    error={fieldError?.city}
                    disabled={pending}
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
                    disabled={pending}
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
                        disabled={pending}
                        withAsterisk
                    />
                ) : (
                    <TextInput
                        name="organization"
                        label={strings.registerOrganizationName}
                        value={formValue.organization}
                        onChange={setFieldValue}
                        error={fieldError?.organization}
                        disabled={pending}
                        withAsterisk
                    />
                )}
                <TextInput
                    name="department"
                    label={strings.registerDepartment}
                    value={formValue.department}
                    onChange={setFieldValue}
                    error={fieldError?.department}
                    disabled={pending}
                />
                <TextInput
                    name="position"
                    label={strings.registerPosition}
                    value={formValue.position}
                    onChange={setFieldValue}
                    error={fieldError?.position}
                    disabled={pending}
                />
                <TextInput
                    name="phone_number"
                    label={strings.registerPhoneNumber}
                    value={formValue.phone_number}
                    onChange={setFieldValue}
                    error={fieldError?.phone_number}
                    disabled={pending}
                />
                {justificationNeeded && (
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
                            error={fieldError?.justification}
                            onChange={setFieldValue}
                            disabled={pending}
                            rows={5}
                            withAsterisk
                        />
                    </>
                )}
            </div>
            <div className={styles.actions}>
                <Button
                    name={undefined}
                    onClick={handleFormSubmit}
                    disabled={pending}
                >
                    {justificationNeeded
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
