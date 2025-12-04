import { useCallback } from 'react';
import {
    BooleanInput,
    Button,
    Container,
    Heading,
    InputSection,
    ListView,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type PartialForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import TabPage from '#components/TabPage';
import { type GoApiBody } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../schema';
import KeyActorsInput from './KeyActorsInput';

import i18n from './i18n.json';

type EapRegisterRequestBody = GoApiBody<'/api/v2/eap-registration/', 'POST'>;
type RegistrationFormFields = PartialForm<EapRegisterRequestBody>;
type KeyActorsFormFields = NonNullable<
    PartialEapFullFormType['key_actors']
>[number];

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    eapRegistrationDetail?: RegistrationFormFields;
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
    const noop = () => { };

    const { setValue: onKeyActorsChange, removeValue: onKeyActorsRemove } = useFormArray<'key_actors', KeyActorsFormFields>(
        'key_actors',
        setFieldValue,
    );

    const handleKeyActorsAdd = useCallback(() => {
        const newKeyActorsItem: KeyActorsFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: KeyActorsFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newKeyActorsItem,
            ],
            'key_actors' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage>
            <Container heading={strings.eapFullFormOverviewHeading}>
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.eapFullFormNationalSociety}
                        description={strings.eapFullFormNationalSocietyDescription}
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
                        title={strings.eapFullFormCountry}
                        description={strings.eapFullFormCountryDescription}
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
                        title={strings.eapFullFormDisasterType}
                        description={strings.eapFullFormDisasterTypeDescription}
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
                        title={strings.eapFullFormUploadCoverImage}
                        description={strings.eapFullFormUploadCoverImageDescription}
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
                            label={strings.eapFullFormUploadAnImageLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormExpectedSubmissionTimeTitle}
                        description={strings.eapFullFormExpectedSubmissionTimeDescription}
                        withAsteriskOnTitle
                    >
                        <TextInput
                            name="expected_submission_time"
                            value={value?.expected_submission_time}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormObjectiveTitle}
                        description={strings.eapFullFormObjectiveDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormWorkWithGovernmentDescriptionLabel}
                            name="objective"
                            value={value?.objective}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container heading={strings.eapFullFormContacts}>
                <ListView layout="block">
                    <Heading level={4}>{strings.eapFullFormNationalHeader}</Heading>
                    <InputSection
                        title={strings.eapFullFormNSContact}
                        description={strings.eapFullFormNSContactDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormNSName}
                            name="national_society_contact_name"
                            value={
                                eapRegistrationDetail?.national_society_contact_name
                                ?? value?.national_society_contact_name
                            }
                            onChange={
                                eapRegistrationDetail?.national_society_contact_name
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(
                                eapRegistrationDetail?.national_society_contact_name,
                            )}
                            error={error?.national_society_contact_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormNSTitle}
                            name="national_society_contact_title"
                            value={
                                eapRegistrationDetail?.national_society_contact_title
                                ?? value?.national_society_contact_title
                            }
                            onChange={
                                eapRegistrationDetail?.national_society_contact_title
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(
                                eapRegistrationDetail?.national_society_contact_title,
                            )}
                            error={error?.national_society_contact_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormNSEmail}
                            name="national_society_contact_email"
                            value={
                                eapRegistrationDetail?.national_society_contact_email
                                ?? value?.national_society_contact_email
                            }
                            onChange={
                                eapRegistrationDetail?.national_society_contact_email
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(
                                eapRegistrationDetail?.national_society_contact_email,
                            )}
                            error={error?.national_society_contact_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormNSPhoneNumber}
                            name="national_society_contact_phone_number"
                            value={
                                eapRegistrationDetail?.national_society_contact_phone_number
                                ?? value?.national_society_contact_phone_number
                            }
                            onChange={
                                eapRegistrationDetail?.national_society_contact_phone_number
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(
                                eapRegistrationDetail?.national_society_contact_phone_number,
                            )}
                            error={error?.national_society_contact_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormPartnerNS}
                        description={strings.eapFullFormPartnerNSDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormPartnerNSName}
                            name="partner_ns_name"
                            value={value?.partner_ns_name}
                            onChange={setFieldValue}
                            error={error?.partner_ns_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormPartnerNSTitle}
                            name="partner_ns_title"
                            value={value?.partner_ns_title}
                            onChange={setFieldValue}
                            error={error?.partner_ns_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormPartnerNSEmail}
                            name="partner_ns_email"
                            value={value?.partner_ns_email}
                            onChange={setFieldValue}
                            error={error?.partner_ns_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormPartnerNSPhoneNumber}
                            name="partner_ns_phone_number"
                            value={value?.partner_ns_phone_number}
                            onChange={setFieldValue}
                            error={error?.partner_ns_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <Heading level={4}>{strings.eapFullFormDelegationHeader}</Heading>
                    <InputSection
                        title={strings.eapFullFormFocalPoint}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormFocalPointName}
                            name="ifrc_delegation_focal_point_name"
                            value={value?.ifrc_delegation_focal_point_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormFocalPointTitle}
                            name="ifrc_delegation_focal_point_title"
                            value={value?.ifrc_delegation_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormFocalPointEmail}
                            name="ifrc_delegation_focal_point_email"
                            value={value?.ifrc_delegation_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormFocalPointPhoneNumber}
                            name="ifrc_delegation_focal_point_phone_number"
                            value={value?.ifrc_delegation_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_delegation_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormDelegation}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormDelegationName}
                            name="ifrc_head_of_delegation_name"
                            value={value?.ifrc_head_of_delegation_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDelegationTitle}
                            name="ifrc_head_of_delegation_title"
                            value={value?.ifrc_head_of_delegation_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDelegationEmail}
                            name="ifrc_head_of_delegation_email"
                            value={value?.ifrc_head_of_delegation_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDelegationPhoneNumber}
                            name="ifrc_head_of_delegation_phone_number"
                            value={value?.ifrc_head_of_delegation_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_head_of_delegation_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <Heading level={4}>{strings.eapFullRegionalHeader}</Heading>
                    <InputSection
                        title={strings.eapFullFormDrefFocalPoint}
                        description={strings.eapFullFormDrefFocalPointDescription}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormDrefFocalPointName}
                            name="dref_focal_point_name"
                            value={
                                eapRegistrationDetail?.dref_focal_point_name
                                ?? value?.dref_focal_point_name
                            }
                            onChange={
                                eapRegistrationDetail?.dref_focal_point_name
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_name)}
                            error={error?.dref_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDrefFocalPointTitle}
                            name="dref_focal_point_title"
                            value={
                                eapRegistrationDetail?.dref_focal_point_title
                                ?? value?.dref_focal_point_title
                            }
                            onChange={
                                eapRegistrationDetail?.dref_focal_point_title
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_title)}
                            error={error?.dref_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDrefFocalPointEmail}
                            name="dref_focal_point_email"
                            value={
                                eapRegistrationDetail?.dref_focal_point_email
                                ?? value?.dref_focal_point_email
                            }
                            onChange={
                                eapRegistrationDetail?.dref_focal_point_email
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(eapRegistrationDetail?.dref_focal_point_email)}
                            error={error?.dref_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormDrefFocalPointPhoneNumber}
                            name="dref_focal_point_phone_number"
                            value={
                                eapRegistrationDetail?.dref_focal_point_phone_number
                                ?? value?.dref_focal_point_phone_number
                            }
                            onChange={
                                eapRegistrationDetail?.dref_focal_point_phone_number
                                    ? noop
                                    : setFieldValue
                            }
                            readOnly={Boolean(
                                eapRegistrationDetail?.dref_focal_point_phone_number,
                            )}
                            error={error?.dref_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormRegionalFocalPoint}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormRegionalFocalPointName}
                            name="ifrc_regional_focal_point_name"
                            value={value?.ifrc_regional_focal_point_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalFocalPointTitle}
                            name="ifrc_regional_focal_point_title"
                            value={value?.ifrc_regional_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalFocalPointEmail}
                            name="ifrc_regional_focal_point_email"
                            value={value?.ifrc_regional_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalFocalPointPhoneNumber}
                            name="ifrc_regional_focal_point_phone_number"
                            value={value?.ifrc_regional_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_focal_point_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormRegionalManager}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormRegionalManagerName}
                            name="ifrc_regional_ops_manager_name"
                            value={value?.ifrc_regional_ops_manager_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalManagerTitle}
                            name="ifrc_regional_ops_manager_title"
                            value={value?.ifrc_regional_ops_manager_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalManagerEmail}
                            name="ifrc_regional_ops_manager_email"
                            value={value?.ifrc_regional_ops_manager_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalManagerPhoneNumber}
                            name="ifrc_regional_ops_manager_phone_number"
                            value={value?.ifrc_regional_ops_manager_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_ops_manager_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormRegionalHead}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormRegionalHeadName}
                            name="ifrc_regional_head_dcc_name"
                            value={value?.ifrc_regional_head_dcc_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalHeadTitle}
                            name="ifrc_regional_head_dcc_title"
                            value={value?.ifrc_regional_head_dcc_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalHeadEmail}
                            name="ifrc_regional_head_dcc_email"
                            value={value?.ifrc_regional_head_dcc_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalHeadPhoneNumber}
                            name="ifrc_regional_head_dcc_phone_number"
                            value={value?.ifrc_regional_head_dcc_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_regional_head_dcc_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormRegionalCoordinator}
                        numPreferredColumns={2}
                    >
                        <TextInput
                            label={strings.eapFullFormRegionalCoordinatorName}
                            name="ifrc_global_ops_coordinator_name"
                            value={value?.ifrc_global_ops_coordinator_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_name}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalCoordinatorTitle}
                            name="ifrc_global_ops_coordinator_title"
                            value={value?.ifrc_global_ops_coordinator_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_title}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalCoordinatorEmail}
                            name="ifrc_global_ops_coordinator_email"
                            value={value?.ifrc_global_ops_coordinator_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_email}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormRegionalCoordinatorPhoneNumber}
                            name="ifrc_global_ops_coordinator_phone_number"
                            value={value?.ifrc_global_ops_coordinator_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_global_ops_coordinator_phone_number}
                            disabled={disabled}
                        />
                    </InputSection>
                    <Heading level={4}>{strings.eapFullStakeholderHeader}</Heading>
                    <InputSection
                        title={strings.eapFullFormWorkWithGovernmentTitle}
                        description={strings.eapFullFormWorkWithGovernmentDescription}
                        withAsteriskOnTitle
                    >
                        <BooleanInput
                            name="is_worked_with_government"
                            value={value?.is_worked_with_government}
                            onChange={setFieldValue}
                            error={error?.is_worked_with_government}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormWorkWithGovernmentDescriptionLabel}
                            name="worked_with_government_description"
                            value={value?.worked_with_government_description}
                            onChange={setFieldValue}
                            error={error?.worked_with_government_description}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormKeyActorsTitle}
                        description={strings.eapFullFormKeyActorsDescription}
                        withAsteriskOnTitle
                    >
                        {value.key_actors?.map((actor, index) => (
                            <KeyActorsInput
                                key={actor.client_id}
                                index={index}
                                value={actor}
                                onChange={onKeyActorsChange}
                                onRemove={onKeyActorsRemove}
                                error={getErrorObject(error?.key_actors)}
                                disabled={disabled}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleKeyActorsAdd}
                            disabled={disabled}
                        >
                            {strings.eapFullFormKeyActorsAddButton}
                        </Button>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormTechnicalWorkingGroupsTitle}
                        description={strings.eapFullFormTechnicalWorkingGroupDescription}
                        withAsteriskOnTitle
                    >
                        <BooleanInput
                            name="is_technical_working_groups"
                            value={value?.is_technical_working_groups}
                            onChange={setFieldValue}
                            error={error?.is_technical_working_groups}
                            disabled={disabled}
                        />
                        <TextInput
                            label={strings.eapFullFormTechnicalWorkingGroupsTitleLabel}
                            name="technically_working_group_title"
                            value={value?.technically_working_group_title}
                            onChange={setFieldValue}
                            error={error?.technically_working_group_title}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.eapFullFormWorkWithGovernmentDescriptionLabel}
                            name="technical_working_groups_in_place_description"
                            value={value?.technical_working_groups_in_place_description}
                            onChange={setFieldValue}
                            error={error?.technical_working_groups_in_place_description}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Overview;
