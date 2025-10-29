import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Heading,
    InputSection,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { useRequest } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function Overview(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const { eapId } = useParams<{ eapId: string }>();

    const {
        pending: fetchingEap,
        response: eapDetailResponse,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
    });

    const handleCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
        },
        [setFieldValue],
    );

    return (
        <div className={styles.simplifiedEapForm}>
            <Container
                heading={strings.simplifiedFormHeading}
                childrenContainerClassName={styles.content}
            >
                <InputSection
                    title={strings.simplifiedFormNationalSociety}
                    description={strings.simplifiedFormNationalSocietyDescription}
                    withAsteriskOnTitle
                >
                    <NationalSocietySelectInput
                        name="national_society"
                        onChange={setFieldValue}
                        value={eapDetailResponse?.national_society}
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
                        value={eapDetailResponse?.country}
                        onChange={handleCountryChange}
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
                        value={eapDetailResponse?.disaster_type}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly
                    />
                </InputSection>
                <InputSection
                    title={strings.simplifiedFormUploadCoverImage}
                    description={strings.simplifiedFormUploadCoverImageDescription}
                    contentSectionClassName={styles.imageInputContent}
                    withAsteriskOnTitle
                >
                    <ImageWithCaptionInput
                        name="cover_image"
                        url="/api/v2/eap-file/"
                        value={value?.cover_image}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.cover_image)}
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
            </Container>
            <Container
                heading={strings.simplifiedFormContacts}
                childrenContainerClassName={styles.content}
            >
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
                        value={eapDetailResponse?.national_society_contact_name}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormNSTitle}
                        name="national_society_contact_title"
                        value={eapDetailResponse?.national_society_contact_title}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormNSEmail}
                        name="national_society_contact_email"
                        value={eapDetailResponse?.national_society_contact_email}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormNSPhoneNumber}
                        name="national_society_contact_phone_number"
                        value={eapDetailResponse?.national_society_contact_phone_number}
                        onChange={setFieldValue}
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
                        name="dref_focal_point_name"
                        value={eapDetailResponse?.dref_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormFocalPointTitle}
                        name="dref_focal_point_title"
                        value={eapDetailResponse?.dref_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormFocalPointEmail}
                        name="dref_focal_point_email"
                        value={eapDetailResponse?.dref_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormFocalPointPhoneNumber}
                        name="dref_focal_point_phone_number"
                        value={eapDetailResponse?.dref_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.simplifiedFormDelegation}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.simplifiedFormDelegationName}
                        name="ifrc_delegation_focal_point_name"
                        value={value?.ifrc_delegation_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDelegationTitle}
                        name="ifrc_delegation_focal_point_title"
                        value={value?.ifrc_delegation_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDelegationEmail}
                        name="ifrc_delegation_focal_point_email"
                        value={value?.ifrc_delegation_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDelegationPhoneNumber}
                        name="ifrc_delegation_focal_point_phone_number"
                        value={value?.ifrc_delegation_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_phone_number}
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
                        value={value?.dref_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDrefFocalPointTitle}
                        name="dref_focal_point_title"
                        value={value?.dref_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDrefFocalPointEmail}
                        name="dref_focal_point_email"
                        value={value?.dref_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.dref_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.simplifiedFormDrefFocalPointPhoneNumber}
                        name="dref_focal_point_phone_number"
                        value={value?.dref_focal_point_phone_number}
                        onChange={setFieldValue}
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
            </Container>
        </div>
    );
}

export default Overview;
