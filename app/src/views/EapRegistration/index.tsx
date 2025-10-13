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

import ContactInputsSection from '#components/domain/ContactInputsSection';
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
    getFullDateFromYearMonth,
    getYearMonthFromFullDate,
} from '#utils/domain/eap';
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

    const onExpectedSubmissionTimeChange = useCallback((val: string | undefined) => {
        if (!val) {
            return;
        }
        setFieldValue(getFullDateFromYearMonth(val), 'expected_submission_time');
    }, [setFieldValue]);

    const handleEapTypeNotSureClick = useCallback(() => {
        setFieldValue(undefined, 'eap_type');
    }, [setFieldValue]);

    const handleSubmissionTimeNotSureClick = useCallback(() => {
        setFieldValue(undefined, 'expected_submission_time');
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
                                type="month"
                                onChange={onExpectedSubmissionTimeChange}
                                value={getYearMonthFromFullDate(value?.expected_submission_time)}
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
                        <ContactInputsSection
                            title={strings.nsContact}
                            description={strings.nsContactDescription}
                            value={value}
                            error={error}
                            setFieldValue={setFieldValue}
                            namePrefix="national_society_contact"
                            withRequiredNameAndEmail
                        />
                        <ContactInputsSection
                            title={strings.ifrcContact}
                            description={strings.ifrcContactDescription}
                            value={value}
                            error={error}
                            setFieldValue={setFieldValue}
                            namePrefix="ifrc_contact"
                        />
                        <ContactInputsSection
                            title={strings.focalPoint}
                            description={strings.focalPointDescription}
                            namePrefix="dref_focal_point"
                            value={value}
                            error={error}
                            setFieldValue={setFieldValue}
                        />
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
