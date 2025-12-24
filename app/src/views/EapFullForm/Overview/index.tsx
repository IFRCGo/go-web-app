import { useCallback } from 'react';
import {
    BooleanInput,
    Button,
    Heading,
    InputSection,
    ListView,
    TextArea,
    TextInput,
    TextOutput,
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
            <ListView layout="block">
                <Heading level={4}>
                    {strings.overviewHeading}
                </Heading>
                <InputSection
                    title={strings.nationalSociety}
                    description={strings.nationalSocietyDescription}
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
                    title={strings.formCountry}
                    description={strings.formCountryDescription}
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
                    title={strings.disasterType}
                    description={strings.disasterTypeDescription}
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
                    title={strings.formUploadCoverImage}
                    description={strings.formUploadCoverImageDescription}
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
                        label={strings.formUploadAnImageLabel}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.formExpectedSubmissionTimeTitle}
                    description={strings.formExpectedSubmissionTimeDescription}
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
                    title={strings.objectiveTitle}
                    description={strings.objectiveDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.workWithGovernmentDescriptionLabel}
                        name="objective"
                        value={value?.objective}
                        onChange={setFieldValue}
                        disabled={disabled}
                    />
                </InputSection>
            </ListView>
            <Heading>
                {strings.formContacts}
            </Heading>
            <ListView layout="block">
                <Heading level={4}>{strings.nationalHeader}</Heading>
                <InputSection
                    title={strings.nSContact}
                    description={strings.nSContactDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.nSName}
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
                        label={strings.nSTitle}
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
                        label={strings.nSEmail}
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
                        label={strings.nSPhoneNumber}
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
                    title={strings.partnerNS}
                    description={strings.partnerNSDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.partnerNSName}
                        name="partner_ns_name"
                        value={value?.partner_ns_name}
                        onChange={setFieldValue}
                        error={error?.partner_ns_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.partnerNSTitle}
                        name="partner_ns_title"
                        value={value?.partner_ns_title}
                        onChange={setFieldValue}
                        error={error?.partner_ns_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.partnerNSEmail}
                        name="partner_ns_email"
                        value={value?.partner_ns_email}
                        onChange={setFieldValue}
                        error={error?.partner_ns_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.partnerNSPhoneNumber}
                        name="partner_ns_phone_number"
                        value={value?.partner_ns_phone_number}
                        onChange={setFieldValue}
                        error={error?.partner_ns_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <Heading level={4}>{strings.delegationHeader}</Heading>
                <InputSection
                    title={strings.formFocalPoint}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.formFocalPointName}
                        name="ifrc_delegation_focal_point_name"
                        value={value?.ifrc_delegation_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.formFocalPointTitle}
                        name="ifrc_delegation_focal_point_title"
                        value={value?.ifrc_delegation_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.formFocalPointEmail}
                        name="ifrc_delegation_focal_point_email"
                        value={value?.ifrc_delegation_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.formFocalPointPhoneNumber}
                        name="ifrc_delegation_focal_point_phone_number"
                        value={value?.ifrc_delegation_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_delegation_focal_point_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.delegation}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.delegationName}
                        name="ifrc_head_of_delegation_name"
                        value={value?.ifrc_head_of_delegation_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_head_of_delegation_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.delegationTitle}
                        name="ifrc_head_of_delegation_title"
                        value={value?.ifrc_head_of_delegation_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_head_of_delegation_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.delegationEmail}
                        name="ifrc_head_of_delegation_email"
                        value={value?.ifrc_head_of_delegation_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_head_of_delegation_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.delegationPhoneNumber}
                        name="ifrc_head_of_delegation_phone_number"
                        value={value?.ifrc_head_of_delegation_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_head_of_delegation_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <Heading level={4}>{strings.regionalHeader}</Heading>
                <InputSection
                    title={strings.drefFocalPoint}
                    description={strings.drefFocalPointDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFocalPointName}
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
                        label={strings.drefFocalPointTitle}
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
                        label={strings.drefFocalPointEmail}
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
                        label={strings.drefFocalPointPhoneNumber}
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
                    title={strings.regionalFocalPoint}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.regionalFocalPointName}
                        name="ifrc_regional_focal_point_name"
                        value={value?.ifrc_regional_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalFocalPointTitle}
                        name="ifrc_regional_focal_point_title"
                        value={value?.ifrc_regional_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalFocalPointEmail}
                        name="ifrc_regional_focal_point_email"
                        value={value?.ifrc_regional_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalFocalPointPhoneNumber}
                        name="ifrc_regional_focal_point_phone_number"
                        value={value?.ifrc_regional_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_focal_point_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.regionalManager}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.regionalManagerName}
                        name="ifrc_regional_ops_manager_name"
                        value={value?.ifrc_regional_ops_manager_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_ops_manager_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalManagerTitle}
                        name="ifrc_regional_ops_manager_title"
                        value={value?.ifrc_regional_ops_manager_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_ops_manager_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalManagerEmail}
                        name="ifrc_regional_ops_manager_email"
                        value={value?.ifrc_regional_ops_manager_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_ops_manager_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalManagerPhoneNumber}
                        name="ifrc_regional_ops_manager_phone_number"
                        value={value?.ifrc_regional_ops_manager_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_ops_manager_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.regionalHead}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.regionalHeadName}
                        name="ifrc_regional_head_dcc_name"
                        value={value?.ifrc_regional_head_dcc_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_head_dcc_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalHeadTitle}
                        name="ifrc_regional_head_dcc_title"
                        value={value?.ifrc_regional_head_dcc_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_head_dcc_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalHeadEmail}
                        name="ifrc_regional_head_dcc_email"
                        value={value?.ifrc_regional_head_dcc_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_head_dcc_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalHeadPhoneNumber}
                        name="ifrc_regional_head_dcc_phone_number"
                        value={value?.ifrc_regional_head_dcc_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_regional_head_dcc_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.regionalCoordinator}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.regionalCoordinatorName}
                        name="ifrc_global_ops_coordinator_name"
                        value={value?.ifrc_global_ops_coordinator_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_global_ops_coordinator_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalCoordinatorTitle}
                        name="ifrc_global_ops_coordinator_title"
                        value={value?.ifrc_global_ops_coordinator_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_global_ops_coordinator_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalCoordinatorEmail}
                        name="ifrc_global_ops_coordinator_email"
                        value={value?.ifrc_global_ops_coordinator_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_global_ops_coordinator_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.regionalCoordinatorPhoneNumber}
                        name="ifrc_global_ops_coordinator_phone_number"
                        value={value?.ifrc_global_ops_coordinator_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_global_ops_coordinator_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <Heading level={4}>{strings.stakeholderHeader}</Heading>
                <InputSection
                    title={strings.workWithGovernmentTitle}
                    tooltip={(
                        <TextOutput
                            label={strings.overviewExplanatoryNoteLabel}
                            strongLabel
                            value={strings.workExplanatoryNote}
                        />
                    )}
                    description={strings.workWithGovernmentDescription}
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
                        label={strings.workWithGovernmentDescriptionLabel}
                        name="worked_with_government_description"
                        value={value?.worked_with_government_description}
                        onChange={setFieldValue}
                        error={error?.worked_with_government_description}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.keyActorsTitle}
                    tooltip={(
                        <ListView layout="block">
                            <TextOutput
                                label={strings.overviewExplanatoryNoteLabel}
                                strongLabel
                                value={strings.actorsExplanatoryNote}
                            />
                            <TextOutput
                                label={strings.overviewRequiredPointsLabel}
                                strongLabel
                                value={(
                                    <ul>
                                        <li>{strings.overviewRequiredPoint1}</li>
                                        <li>{strings.overviewRequiredPoint2}</li>
                                        <li>{strings.overviewRequiredPoint3}</li>
                                    </ul>
                                )}
                            />
                        </ListView>
                    )}
                    description={strings.keyActorsDescription}
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
                        {strings.keyActorsAddButton}
                    </Button>
                </InputSection>
                <InputSection
                    title={strings.technicalWorkingGroupsTitle}
                    description={strings.technicalWorkingGroupDescription}
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
                        label={strings.technicalWorkingGroupsTitleLabel}
                        name="technically_working_group_title"
                        value={value?.technically_working_group_title}
                        onChange={setFieldValue}
                        error={error?.technically_working_group_title}
                        disabled={disabled}
                    />
                    <TextArea
                        label={strings.workWithGovernmentDescriptionLabel}
                        name="technical_working_groups_in_place_description"
                        value={value?.technical_working_groups_in_place_description}
                        onChange={setFieldValue}
                        error={error?.technical_working_groups_in_place_description}
                        disabled={disabled}
                    />
                </InputSection>
            </ListView>
        </TabPage>
    );
}

export default Overview;
