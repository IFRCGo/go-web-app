import {
    type ElementRef,
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    Button,
    Container,
    DateInput,
    InputSection,
    ListView,
    Modal,
    Radio,
    RadioInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
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
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    defaultFormValue,
    type EapRegisterFormFields,
    type EapRegisterRequestBody,
    formSchema,
} from './schema';

import i18n from './i18n.json';

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

    const { eap_eap_type: eapFormOptions } = useGlobalEnums();

    const error = getErrorObject(formError);
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [
        showEapRegistrationsuccessModal,
        setShowEapRegistrationsuccessModal,
    ] = useState(false);

    const {
        pending: eapRegistrationPending,
        trigger: triggerEapRegistration,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/',
        body: (body: EapRegisterRequestBody) => body,
        onSuccess: () => {
            const message = strings.registrationSuccess;
            alert.show(
                message,
                { variant: 'success' },
            );
            setShowEapRegistrationsuccessModal(true);
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                },
            } = err;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.registrationFailure,
                { variant: 'danger' },
            );
        },
    });

    const handleEapTypeNotSureClick = useCallback(() => {
        setFieldValue(null, 'eap_type');
    }, [setFieldValue]);

    const handleSubmissionTimeNotSureClick = useCallback(() => {
        setFieldValue(null, 'expected_submission_time');
    }, [setFieldValue]);

    const handleRegisterFormValidation = useCallback((formValues: EapRegisterFormFields) => {
        triggerEapRegistration(formValues as EapRegisterRequestBody);
    }, [triggerEapRegistration]);

    const handleFormError = useCallback(() => {
        setTimeout(() => formContentRef.current?.scrollIntoView(), 200);
    }, []);

    const handleSubmitButtonClick = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            handleRegisterFormValidation,
            handleFormError,
        );
        handler();
    }, [
        handleFormError,
        handleRegisterFormValidation,
        validate,
        setError,
    ]);

    const handleNationalSocietyInputChange = useCallback((newValue: number | undefined) => {
        setFieldValue(newValue, 'national_society');
        setFieldValue(newValue, 'country');
    }, [setFieldValue]);

    const handleRegistrationsuccessModalClose = useCallback(() => {
        setShowEapRegistrationsuccessModal(false);
        navigate('accountMyFormsEap');
    }, [navigate]);

    const disabled = eapRegistrationPending;

    return (
        <Page
            heading={strings.registrationHeading}
            description={resolveToComponent(
                strings.registrationDescription,
                {
                    link: (
                        <Link
                            to="eapDetail"
                            withUnderline
                        >
                            {strings.registrationLink}
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
                    {strings.cancelButton}
                </Link>
            )}
            elementRef={formContentRef}
            withBackgroundColorInMainSection
        >
            <ListView
                layout="block"
                spacing="xl"
            >
                <Container
                    heading={strings.applicationDetails}
                    variant="form"
                >
                    <ListView
                        layout="block"
                        spacing="sm"
                    >
                        <InputSection
                            title={strings.nationalSociety}
                            description={strings.nationalSocietyDescription}
                            withAsteriskOnTitle
                        >
                            <NationalSocietySelectInput
                                error={error?.national_society}
                                name="national_society"
                                onChange={handleNationalSocietyInputChange}
                                value={value?.national_society}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.country}
                            description={strings.countryDescription}
                            withAsteriskOnTitle
                            numPreferredColumns={2}
                        >
                            <CountrySelectInput
                                error={error?.country}
                                name="country"
                                onChange={setFieldValue}
                                value={value?.country}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.disasterType}
                            description={strings.disasterTypeDescription}
                            withAsteriskOnTitle
                            numPreferredColumns={2}
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
                            title={strings.type}
                            // TODO: Add link here
                            description={strings.typeDescription}
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
                                />
                                <Radio
                                    name="eap_type"
                                    value={isNotDefined(value?.eap_type)}
                                    onClick={handleEapTypeNotSureClick}
                                >
                                    {strings.notSure}
                                </Radio>
                            </ListView>
                        </InputSection>
                        <InputSection
                            title={strings.submission}
                            description={strings.submissionDescription}
                            withAsteriskOnTitle
                            numPreferredColumns={2}
                        >
                            <DateInput
                                name="expected_submission_time"
                                onChange={setFieldValue}
                                value={value?.expected_submission_time}
                                error={error?.expected_submission_time}
                            />
                            <Radio
                                name="expected_submission_time"
                                value={isNotDefined(value?.expected_submission_time)}
                                onClick={handleSubmissionTimeNotSureClick}
                            >
                                {strings.notSure}
                            </Radio>
                        </InputSection>
                        <InputSection
                            title={strings.partnersInvolved}
                            description={strings.partnersInvolvedDescription}
                            withAsteriskOnTitle
                        >
                            <NationalSocietyMultiSelectInput
                                name="partners"
                                value={value.partners}
                                error={getErrorString(error?.partners)}
                                onChange={setFieldValue}
                                disabled={disabled}
                            />
                        </InputSection>
                    </ListView>
                </Container>
                <Container
                    heading={strings.contacts}
                    variant="form"
                >
                    <ListView
                        layout="block"
                        spacing="sm"
                    >
                        <InputSection
                            title={strings.nsContact}
                            description={strings.nsContactDescription}
                            numPreferredColumns={2}
                        >
                            <TextInput
                                label={strings.nsName}
                                name="national_society_contact_name"
                                value={value?.national_society_contact_name}
                                onChange={setFieldValue}
                                error={error?.national_society_contact_name}
                                disabled={disabled}
                                required
                            />
                            <TextInput
                                label={strings.nsTitle}
                                name="national_society_contact_title"
                                value={value?.national_society_contact_title}
                                onChange={setFieldValue}
                                error={error?.national_society_contact_title}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.nsEmail}
                                name="national_society_contact_email"
                                value={value?.national_society_contact_email}
                                onChange={setFieldValue}
                                error={error?.national_society_contact_email}
                                disabled={disabled}
                                required
                            />
                            <TextInput
                                label={strings.nsPhoneNumber}
                                name="national_society_contact_phone_number"
                                value={value?.national_society_contact_phone_number}
                                onChange={setFieldValue}
                                error={error?.national_society_contact_phone_number}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.ifrcContact}
                            description={strings.ifrcContactDescription}
                            numPreferredColumns={2}
                        >
                            <TextInput
                                label={strings.ifrcName}
                                name="ifrc_contact_name"
                                value={value?.ifrc_contact_name}
                                onChange={setFieldValue}
                                error={error?.ifrc_contact_name}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.ifrcTitle}
                                name="ifrc_contact_title"
                                value={value?.ifrc_contact_title}
                                onChange={setFieldValue}
                                error={error?.ifrc_contact_title}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.ifrcEmail}
                                name="ifrc_contact_email"
                                value={value?.ifrc_contact_email}
                                onChange={setFieldValue}
                                error={error?.ifrc_contact_email}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.ifrcPhoneNumber}
                                name="ifrc_contact_phone_number"
                                value={value?.ifrc_contact_phone_number}
                                onChange={setFieldValue}
                                error={error?.ifrc_contact_phone_number}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.focalPoint}
                            description={strings.focalPointDescription}
                            numPreferredColumns={2}
                        >
                            <TextInput
                                label={strings.focalPointName}
                                name="dref_focal_point_name"
                                value={value?.dref_focal_point_name}
                                onChange={setFieldValue}
                                error={error?.dref_focal_point_name}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.focalPointTitle}
                                name="dref_focal_point_title"
                                value={value?.dref_focal_point_title}
                                onChange={setFieldValue}
                                error={error?.dref_focal_point_title}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.focalPointEmail}
                                name="dref_focal_point_email"
                                value={value?.dref_focal_point_email}
                                onChange={setFieldValue}
                                error={error?.dref_focal_point_email}
                                disabled={disabled}
                            />
                            <TextInput
                                label={strings.focalPointPhoneNumber}
                                name="dref_focal_point_phone_number"
                                value={value?.dref_focal_point_phone_number}
                                onChange={setFieldValue}
                                error={error?.dref_focal_point_phone_number}
                                disabled={disabled}
                            />
                        </InputSection>
                    </ListView>
                </Container>
                <ListView withCenteredContents>
                    <Button
                        name={undefined}
                        disabled={disabled}
                        onClick={handleSubmitButtonClick}
                    >
                        {strings.submitButton}
                    </Button>
                </ListView>
            </ListView>
            {showEapRegistrationsuccessModal && (
                <Modal
                    size="sm"
                    heading={strings.successModalHeading}
                    withHeaderBorder
                    onClose={handleRegistrationsuccessModalClose}
                    footerActions={(
                        <Button
                            name={undefined}
                            styleVariant="filled"
                            onClick={handleRegistrationsuccessModalClose}
                        >
                            {strings.closeButtonLabel}
                        </Button>
                    )}
                >
                    {strings.successModalDescription}
                </Modal>
            )}
        </Page>
    );
}

Component.displayName = 'EapRegistration';
