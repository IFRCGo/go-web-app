import {
    type ElementRef,
    useCallback,
    useRef,
} from 'react';
import {
    ConfirmButton,
    Container,
    DateInput,
    InputSection,
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
    createSubmitHandler,
    getErrorObject,
    useForm,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
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
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    defaultFormValue,
    formSchema,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const {
        value,
        setFieldValue,
        error: formError,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const {
        eap_eap_type: eapFormOptions,
    } = useGlobalEnums();

    const error = getErrorObject(formError);
    const formContentRef = useRef<ElementRef<'div'>>(null);

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

    const handleCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    const handleEapTypeClick = useCallback(() => {
        setFieldValue(undefined, 'eap_type');
    }, [setFieldValue]);

    const handleSubmissionTimeClick = useCallback(() => {
        setFieldValue(undefined, 'expected_submission_time');
    }, [setFieldValue]);

    const eapRegistration = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            (formValues) => {
                eapRegister(formValues as EapRegisterRequestBody);
            },
        );
        handler();
    }, [
        setError,
        validate,
        eapRegister,
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

    const disabled = eapRegistrationPending;

    return (
        <Page
            mainSectionClassName={styles.eapRegistrationForm}
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
                    variant="secondary"
                >
                    {strings.eapCancelButton}
                </Link>
            )}
            withBackgroundColorInMainSection
        >
            <div ref={formContentRef}>
                <Container
                    heading={strings.eapApplicationDetails}
                    childrenContainerClassName={styles.content}
                >
                    <InputSection
                        title={strings.eapNationalSociety}
                        description={strings.eapNationalSocietyDescription}
                        withAsteriskOnTitle
                    >
                        <NationalSocietySelectInput
                            error={error?.national_society}
                            name="national_society"
                            onChange={setFieldValue}
                            value={value?.national_society}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapCountry}
                        description={strings.eapCountryDescription}
                        withAsteriskOnTitle
                    >
                        <CountrySelectInput
                            error={error?.country}
                            name="country"
                            onChange={handleCountryChange}
                            value={value?.country}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapDisasterType}
                        description={strings.eapDisasterTypeDescription}
                        withAsteriskOnTitle
                    >
                        <DisasterTypeSelectInput
                            name="disaster_type"
                            value={value?.disaster_type}
                            onChange={setFieldValue}
                            error={error?.disaster_type}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapType}
                        // TODO: Add link here
                        description={strings.eapTypeDescription}
                        contentSectionClassName={styles.radioContent}
                        withAsteriskOnTitle
                    >
                        <RadioInput
                            name="eap_type"
                            value={value?.eap_type}
                            onChange={setFieldValue}
                            options={eapFormOptions}
                            keySelector={eapTypeKeySelector}
                            labelSelector={stringValueSelector}
                            error={error?.eap_type}
                        />
                        <Radio
                            name="eap_type"
                            label={strings.eapNotSure}
                            value={value?.eap_type === undefined}
                            onClick={handleEapTypeClick}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapSubmission}
                        description={strings.eapSubmissionDescription}
                        contentSectionClassName={styles.radioContent}
                        withAsteriskOnTitle
                    >
                        <DateInput
                            name="expected_submission_time"
                            onChange={setFieldValue}
                            value={value?.expected_submission_time}
                            error={error?.expected_submission_time}
                        />
                        <Radio
                            name="expected_submission_time"
                            label={strings.eapNotSure}
                            value={value?.expected_submission_time === undefined}
                            onClick={handleSubmissionTimeClick}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapPartnersInvolved}
                        description={strings.eapPartnersInvolvedDescription}
                        withAsteriskOnTitle
                    >
                        <NationalSocietyMultiSelectInput
                            name="partners"
                            value={value.partners}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                </Container>
                <Container
                    heading={strings.eapContacts}
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
                        />
                        <TextInput
                            label={strings.eapNSTitle}
                            name="national_society_contact_title"
                            value={value?.national_society_contact_title}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapNSEmail}
                            name="national_society_contact_email"
                            value={value?.national_society_contact_email}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapNSPhoneNumber}
                            name="national_society_contact_phone_number"
                            value={value?.national_society_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_phone_number}
                            disabled={disabled}
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
                        />
                        <TextInput
                            label={strings.eapIFRCTitle}
                            name="ifrc_contact_title"
                            value={value?.ifrc_contact_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapIFRCEmail}
                            name="ifrc_contact_email"
                            value={value?.ifrc_contact_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapIFRCPhoneNumber}
                            name="ifrc_contact_phone_number"
                            value={value?.ifrc_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_contact_phone_number}
                            disabled={disabled}
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
                        />
                        <TextInput
                            label={strings.eapFocalPointTitle}
                            name="dref_focal_point_title"
                            value={value?.dref_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFocalPointEmail}
                            name="dref_focal_point_email"
                            value={value?.dref_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFocalPointPhoneNumber}
                            name="dref_focal_point_phone_number"
                            value={value?.dref_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.dref_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                </Container>
            </div>
            <div className={styles.footer}>
                <ConfirmButton
                    name={undefined}
                    confirmHeading={strings.eapDevelopmentRegistrationHeading}
                    confirmMessage={strings.eapDevelopmentRegistrationDescription}
                    onConfirm={handleEapRegistration}
                    disabled={disabled}
                >
                    {strings.eapSubmitButton}
                </ConfirmButton>
            </div>
        </Page>
    );
}
