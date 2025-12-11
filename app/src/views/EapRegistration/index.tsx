import {
    type ElementRef,
    useCallback,
    useRef,
} from 'react';
import {
    useLocation,
    useParams,
} from 'react-router-dom';
import {
    ConfirmButton,
    Container,
    DateInput,
    InputSection,
    ListView,
    Radio,
    RadioInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    useForm,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import NationalSocietyMultiSelectInput from '#components/domain/NationalSocietyMultiSelectInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import Link from '#components/Link';
import Page from '#components/Page';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    defaultFormValue,
    formSchema,
} from './schema';

import i18n from './i18n.json';

type EapRegisterRequestBody = GoApiBody<'/api/v2/eap-registration/', 'POST'>;
type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EapTypeOption = NonNullable<GlobalEnumsResponse['eap_eap_type']>[number];

function eapTypeKeySelector(option: EapTypeOption) {
    return option.key;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlert();
    const { navigate } = useRouting();
    const { eapId: eapIdFromParams } = useParams<{ eapId: string }>();

    const { state } = useLocation();
    const eapId = eapIdFromParams ?? state?.eapId as string | undefined;
    const isReadOnly = state?.mode === 'view';

    const {
        value,
        setFieldValue,
        error: formError,
        setError,
        setValue,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        eap_eap_type: eapFormOptions,
    } = useGlobalEnums();

    const error = getErrorObject(formError);
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const {
        pending: fetchingEap,
        error: eapError,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
        onSuccess: (response) => {
            const {
                ...formValues
            } = response;
            setValue(formValues);
        },
    });

    const {
        pending: eapRegistrationPending,
        trigger: eapRegister,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/',
        body: (body: EapRegisterRequestBody) => body,
        onSuccess: () => {
            const message = strings.eapRegistrationSuccess;
            alert.show(
                message,
                { variant: 'success' },
            );
            navigate('accountMyFormsEap');
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                },
            } = err;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.eapRegistrationFailure,
                { variant: 'danger' },
            );
        },
    });

    const {
        pending: updateEapRegistrationPending,
        trigger: updateEapRegistration,
    } = useLazyRequest({
        url: '/api/v2/eap-registration/{id}/',
        method: 'PATCH',
        pathVariables: {
            id: Number(eapId),
        },
        body: (formFields: EapRegisterRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.eapRegistrationUpdateMessage,
                { variant: 'success' },
            );
            navigate(
                'accountMyFormsEap',
                { params: { eapId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
            } = err;

            setError(transformObjectError(
                formErrors,
                () => undefined,
            ));

            alert.show(
                strings.eapRegistrationFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
        },
    });

    const handleCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handleEapTypeClick = useCallback(() => {
        if (isReadOnly) {
            return;
        }
        setFieldValue(null, 'eap_type');
    }, [isReadOnly, setFieldValue]);

    const handleSubmissionTimeClick = useCallback(() => {
        if (isReadOnly) {
            return;
        }
        setFieldValue(null, 'expected_submission_time');
    }, [isReadOnly, setFieldValue]);

    const eapRegistration = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            (formValues) => {
                if (isNotDefined(eapId)) {
                    eapRegister(formValues as EapRegisterRequestBody);
                } else {
                    updateEapRegistration({
                        ...formValues,
                        id: eapId,
                    } as EapRegisterRequestBody);
                }
            },
        );
        handler();
    }, [
        setError,
        validate,
        eapRegister,
        updateEapRegistration,
        eapId,
    ]);

    const handleFormError = useCallback(() => {
        setTimeout(() => formContentRef.current?.scrollIntoView(), 200);
    }, []);

    const handleEapRegistration = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            eapRegistration,
            handleFormError,
        );
        handler();
    }, [
        handleFormError,
        eapRegistration,
        validate,
        setError,
    ]);

    const disabled = eapRegistrationPending || fetchingEap || updateEapRegistrationPending;

    const handleNationalSocietyInputChange = useCallback((newValue: number | undefined) => {
        setFieldValue(newValue, 'national_society');
        setFieldValue(newValue, 'country');
    }, [setFieldValue]);

    if (isDefined(eapError)) {
        return (
            <FormFailedToLoadMessage
                description={strings.eapFailedToLoad}
            />
        );
    }

    return (
        <Page
            heading={strings.eapRegistrationHeading}
            description={resolveToComponent(
                strings.eapRegistrationDescription,
                {
                    link: (
                        <Link
                            to="eapDetail"
                        >
                            {strings.eapRegistrationLink}
                        </Link>
                    ),
                },
            )}
            actions={(
                <Link
                    to="accountMyFormsEap"
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {eapId ? strings.eapBackButton : strings.eapCancelButton}
                </Link>
            )}
            elementRef={formContentRef}
            withBackgroundColorInMainSection
        >
            <Container heading={strings.eapApplicationDetails}>
                <ListView layout="block">
                    <InputSection
                        title={strings.eapNationalSociety}
                        description={strings.eapNationalSocietyDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <NationalSocietySelectInput
                            error={error?.national_society}
                            name="national_society"
                            onChange={handleNationalSocietyInputChange}
                            value={value?.national_society}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapCountry}
                        description={strings.eapCountryDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <CountrySelectInput
                            error={error?.country}
                            name="country"
                            onChange={handleCountryChange}
                            value={value?.country}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapDisasterType}
                        description={strings.eapDisasterTypeDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <DisasterTypeSelectInput
                            name="disaster_type"
                            value={value?.disaster_type}
                            onChange={setFieldValue}
                            error={error?.disaster_type}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapType}
                        // TODO: Add link here
                        description={strings.eapTypeDescription}
                        withAsteriskOnTitle
                    >
                        <ListView>
                            <RadioInput
                                name="eap_type"
                                value={value?.eap_type ?? undefined}
                                onChange={setFieldValue}
                                options={eapFormOptions}
                                keySelector={eapTypeKeySelector}
                                labelSelector={stringValueSelector}
                                error={error?.eap_type}
                                readOnly={isReadOnly}
                            />
                            <Radio
                                name="eap_type"
                                value={isNotDefined(value?.eap_type)}
                                onClick={handleEapTypeClick}
                                readOnly={isReadOnly}
                            >
                                {strings.eapNotSure}
                            </Radio>
                        </ListView>
                    </InputSection>
                    <InputSection
                        title={strings.eapSubmission}
                        description={strings.eapSubmissionDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <DateInput
                            name="expected_submission_time"
                            onChange={setFieldValue}
                            value={value?.expected_submission_time}
                            error={error?.expected_submission_time}
                            readOnly={isReadOnly}
                        />
                        <Radio
                            name="expected_submission_time"
                            value={isNotDefined(value?.expected_submission_time)}
                            onClick={handleSubmissionTimeClick}
                            readOnly={isReadOnly}
                        >
                            {strings.eapNotSure}
                        </Radio>
                    </InputSection>
                    <InputSection
                        title={strings.eapPartnersInvolved}
                        description={strings.eapPartnersInvolvedDescription}
                        withAsteriskOnTitle
                    >
                        <NationalSocietyMultiSelectInput
                            name="partners"
                            value={value.partners}
                            error={getErrorString(error?.partners)}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.eapContacts}
                spacing="md"
            >
                <ListView
                    layout="block"
                >
                    <InputSection
                        title={strings.eapNSContact}
                        description={strings.eapNSContactDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapNSName}
                            name="national_society_contact_name"
                            value={value?.national_society_contact_name}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_name}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapNSTitle}
                            name="national_society_contact_title"
                            value={value?.national_society_contact_title}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_title}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapNSEmail}
                            name="national_society_contact_email"
                            value={value?.national_society_contact_email}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_email}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapNSPhoneNumber}
                            name="national_society_contact_phone_number"
                            value={value?.national_society_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_phone_number}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapIFRCContact}
                        description={strings.eapIFRCContactDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapIFRCName}
                            name="ifrc_contact_name"
                            value={value?.ifrc_contact_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_name}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapIFRCTitle}
                            name="ifrc_contact_title"
                            value={value?.ifrc_contact_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_title}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapIFRCEmail}
                            name="ifrc_contact_email"
                            value={value?.ifrc_contact_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_email}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapIFRCPhoneNumber}
                            name="ifrc_contact_phone_number"
                            value={value?.ifrc_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_phone_number}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFocalPoint}
                        description={strings.eapFocalPointDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFocalPointName}
                            name="dref_focal_point_name"
                            value={value?.dref_focal_point_name}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_name}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapFocalPointTitle}
                            name="dref_focal_point_title"
                            value={value?.dref_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_title}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapFocalPointEmail}
                            name="dref_focal_point_email"
                            value={value?.dref_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_email}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                        <TextInput
                            label={strings.eapFocalPointPhoneNumber}
                            name="dref_focal_point_phone_number"
                            value={value?.dref_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_phone_number}
                            disabled={disabled}
                            readOnly={isReadOnly}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <ListView withCenteredContents>
                <ConfirmButton
                    name={undefined}
                    confirmHeading={strings.eapDevelopmentRegistrationHeading}
                    confirmMessage={strings.eapDevelopmentRegistrationDescription}
                    onConfirm={handleEapRegistration}
                    disabled={disabled || isReadOnly}
                >
                    {strings.eapSubmitButton}
                </ConfirmButton>
            </ListView>
        </Page>
    );
}
