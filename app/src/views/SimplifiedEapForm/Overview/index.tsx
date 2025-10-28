import {
    Container,
    Heading,
    InputSection,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type PartialForm,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import TabPage from '#components/TabPage';
import { type GoApiBody } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

type EapRegisterRequestBody = GoApiBody<'/api/v2/eap-registration/', 'POST'>;
type FormFields = PartialForm<EapRegisterRequestBody>;

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    eapRegistrationDetail?: FormFields;
}

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        eapRegistrationDetail,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const noop = () => {};

    return (
        <TabPage>
            <Container
                heading={strings.simplifiedFormHeading}
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.simplifiedFormNationalSociety}
                        description={strings.simplifiedFormNationalSocietyDescription}
                        withAsteriskOnTitle
                    >
                        <NationalSocietySelectInput
                            name="national_society"
                            onChange={noop}
                            value={eapRegistrationDetail?.national_society}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormCountry}
                        description={strings.simplifiedFormCountryDescription}
                        withAsteriskOnTitle
                    >
                        <CountrySelectInput
                            name="country"
                            value={eapRegistrationDetail?.country}
                            onChange={noop}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormDisasterType}
                        description={strings.simplifiedFormDisasterTypeDescription}
                        withAsteriskOnTitle
                    >
                        <DisasterTypeSelectInput
                            name="disaster_type"
                            value={eapRegistrationDetail?.disaster_type}
                            onChange={noop}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormUploadCoverImage}
                        description={strings.simplifiedFormUploadCoverImageDescription}
                        withAsteriskOnTitle
                    >
                        <ImageWithCaptionInput
                            name="cover_image_file"
                            url="/api/v2/eap-file/"
                            value={value?.cover_image_file}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.cover_image_file)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.simplifiedFormUploadAnImageLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormTimeframe}
                        description={strings.simplifiedFormTimeframeDescription}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            name="seap_timeframe"
                            value={value?.seap_timeframe}
                            onChange={setFieldValue}
                            error={error?.seap_timeframe}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.simplifiedFormContacts}
            >
                <ListView layout="block">
                    <Heading
                        level={4}
                    >
                        {strings.simplifiedFormNationalHeader}
                    </Heading>
                    <InputSection
                        title={strings.simplifiedFormNSContact}
                        description={strings.simplifiedFormNSContactDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormNSName}
                            name="national_society_contact_name"
                            value={eapRegistrationDetail?.national_society_contact_name
                                ?? value?.national_society_contact_name}
                            onChange={eapRegistrationDetail?.national_society_contact_name
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail?.national_society_contact_name)}
                            error={error?.national_society_contact_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormNSTitle}
                            name="national_society_contact_title"
                            value={eapRegistrationDetail?.national_society_contact_title
                                ?? value?.national_society_contact_title}
                            onChange={eapRegistrationDetail?.national_society_contact_title
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail
                                ?.national_society_contact_title)}
                            error={error?.national_society_contact_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormNSEmail}
                            name="national_society_contact_email"
                            value={eapRegistrationDetail?.national_society_contact_email
                                ?? value?.national_society_contact_email}
                            onChange={eapRegistrationDetail?.national_society_contact_email
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail
                                ?.national_society_contact_email)}
                            error={error?.national_society_contact_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormNSPhoneNumber}
                            name="national_society_contact_phone_number"
                            value={eapRegistrationDetail?.national_society_contact_phone_number
                                ?? value?.national_society_contact_phone_number}
                            onChange={eapRegistrationDetail?.national_society_contact_phone_number
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail
                                ?.national_society_contact_phone_number)}
                            error={error?.national_society_contact_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormPartnerNS}
                        description={strings.simplifiedFormPartnerNSDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormPartnerNSName}
                            name="partner_ns_name"
                            value={value?.partner_ns_name}
                            onChange={setFieldValue}
                            error={error?.partner_ns_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormPartnerNSTitle}
                            name="partner_ns_title"
                            value={value?.partner_ns_title}
                            onChange={setFieldValue}
                            error={error?.partner_ns_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormPartnerNSEmail}
                            name="partner_ns_email"
                            value={value?.partner_ns_email}
                            onChange={setFieldValue}
                            error={error?.partner_ns_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormPartnerNSPhoneNumber}
                            name="partner_ns_phone_number"
                            value={value?.partner_ns_phone_number}
                            onChange={setFieldValue}
                            error={error?.partner_ns_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <Heading
                        level={4}
                    >
                        {strings.simplifiedFormDelegationHeader}
                    </Heading>
                    <InputSection
                        title={strings.simplifiedFormFocalPoint}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormFocalPointName}
                            name="ifrc_delegation_focal_point_name"
                            value={value?.ifrc_delegation_focal_point_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormFocalPointTitle}
                            name="ifrc_delegation_focal_point_title"
                            value={value?.ifrc_delegation_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormFocalPointEmail}
                            name="ifrc_delegation_focal_point_email"
                            value={value?.ifrc_delegation_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormFocalPointPhoneNumber}
                            name="ifrc_delegation_focal_point_phone_number"
                            value={value?.ifrc_delegation_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormDelegation}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormDelegationName}
                            name="ifrc_head_of_delegation_name"
                            value={value?.ifrc_head_of_delegation_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDelegationTitle}
                            name="ifrc_head_of_delegation_title"
                            value={value?.ifrc_head_of_delegation_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDelegationEmail}
                            name="ifrc_head_of_delegation_email"
                            value={value?.ifrc_head_of_delegation_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDelegationPhoneNumber}
                            name="ifrc_head_of_delegation_phone_number"
                            value={value?.ifrc_head_of_delegation_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <Heading
                        level={4}
                    >
                        {strings.simplifiedRegionalHeader}
                    </Heading>
                    <InputSection
                        title={strings.simplifiedFormDrefFocalPoint}
                        description={strings.simplifiedFormDrefFocalPointDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormDrefFocalPointName}
                            name="dref_focal_point_name"
                            value={eapRegistrationDetail?.dref_focal_point_name
                                ?? value?.dref_focal_point_name}
                            onChange={eapRegistrationDetail?.dref_focal_point_name
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_name)}
                            error={error?.dref_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDrefFocalPointTitle}
                            name="dref_focal_point_title"
                            value={eapRegistrationDetail?.dref_focal_point_title
                                ?? value?.dref_focal_point_title}
                            onChange={eapRegistrationDetail?.dref_focal_point_title
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_title)}
                            error={error?.dref_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDrefFocalPointEmail}
                            name="dref_focal_point_email"
                            value={eapRegistrationDetail?.dref_focal_point_email
                                ?? value?.dref_focal_point_email}
                            onChange={eapRegistrationDetail?.dref_focal_point_email
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_email)}
                            error={error?.dref_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormDrefFocalPointPhoneNumber}
                            name="dref_focal_point_phone_number"
                            value={eapRegistrationDetail?.dref_focal_point_phone_number
                                ?? value?.dref_focal_point_phone_number}
                            onChange={eapRegistrationDetail?.dref_focal_point_phone_number
                                ? noop : setFieldValue}
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_phone_number)}
                            error={error?.dref_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormRegionalFocalPoint}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormRegionalFocalPointName}
                            name="ifrc_regional_focal_point_name"
                            value={value?.ifrc_regional_focal_point_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalFocalPointTitle}
                            name="ifrc_regional_focal_point_title"
                            value={value?.ifrc_regional_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalFocalPointEmail}
                            name="ifrc_regional_focal_point_email"
                            value={value?.ifrc_regional_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalFocalPointPhoneNumber}
                            name="ifrc_regional_focal_point_phone_number"
                            value={value?.ifrc_regional_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormRegionalManager}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormRegionalManagerName}
                            name="ifrc_regional_ops_manager_name"
                            value={value?.ifrc_regional_ops_manager_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalManagerTitle}
                            name="ifrc_regional_ops_manager_title"
                            value={value?.ifrc_regional_ops_manager_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalManagerEmail}
                            name="ifrc_regional_ops_manager_email"
                            value={value?.ifrc_regional_ops_manager_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalManagerPhoneNumber}
                            name="ifrc_regional_ops_manager_phone_number"
                            value={value?.ifrc_regional_ops_manager_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormRegionalHead}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormRegionalHeadName}
                            name="ifrc_regional_head_dcc_name"
                            value={value?.ifrc_regional_head_dcc_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalHeadTitle}
                            name="ifrc_regional_head_dcc_title"
                            value={value?.ifrc_regional_head_dcc_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalHeadEmail}
                            name="ifrc_regional_head_dcc_email"
                            value={value?.ifrc_regional_head_dcc_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalHeadPhoneNumber}
                            name="ifrc_regional_head_dcc_phone_number"
                            value={value?.ifrc_regional_head_dcc_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.simplifiedFormRegionalCoordinator}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.simplifiedFormRegionalCoordinatorName}
                            name="ifrc_global_ops_coordinator_name"
                            value={value?.ifrc_global_ops_coordinator_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalCoordinatorTitle}
                            name="ifrc_global_ops_coordinator_title"
                            value={value?.ifrc_global_ops_coordinator_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalCoordinatorEmail}
                            name="ifrc_global_ops_coordinator_email"
                            value={value?.ifrc_global_ops_coordinator_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.simplifiedFormRegionalCoordinatorPhoneNumber}
                            name="ifrc_global_ops_coordinator_phone_number"
                            value={value?.ifrc_global_ops_coordinator_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Overview;
