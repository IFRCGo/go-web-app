import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    Description,
    InputSection,
    Label,
    ListView,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import ContactInputsSection from '#components/domain/ContactInputsSection';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietyMultiSelectInput from '#components/domain/NationalSocietyMultiSelectInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import {
    getFullDateFromYearMonth,
    getYearMonthFromFullDate,
} from '#utils/domain/eap';
import { type GoApiResponse } from '#utils/restRequest';

import { charLimits } from '../common';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';
import KeyActorsInput from './KeyActorsInput';
import PartnerContactsInput from './PartnerContactsInput';

import i18n from './i18n.json';

type EapRegisterRequestDetails = GoApiResponse<'/api/v2/eap-registration/{id}/'>;
type KeyActorsFormFields = NonNullable<
    PartialEapFullFormType['key_actors']
>[number];

type PartnerContactFormFields = NonNullable<
    PartialEapFullFormType['partner_contacts']
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
    eapRegistrationDetail?: EapRegisterRequestDetails;
    readOnly?: boolean;
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
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    // NOTE: We dont want some fields to have onChange functionality
    const noop = () => { };
    const {
        setValue: onPartnerContactChange,
        removeValue: onPartnerContactRemove,
    } = useFormArray<'partner_contacts', PartnerContactFormFields>(
        'partner_contacts',
        setFieldValue,
    );

    const handlePartnerContactAdd = useCallback(() => {
        const newPartnerContactItem: PartnerContactFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: PartnerContactFormFields[] | undefined) => (
                [...(oldValue ?? []), newPartnerContactItem]
            ),
            'partner_contacts' as const,
        );
    }, [setFieldValue]);

    const onExpectedSubmissionTimeChange = useCallback((val: string | undefined) => {
        if (!val) {
            return;
        }
        setFieldValue(getFullDateFromYearMonth(val), 'expected_submission_time');
    }, [setFieldValue]);

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
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.overviewSectionHeading}
                    content={(
                        <ListView withSpacingOpticalCorrection layout="block">
                            <Description>
                                {strings.sectionCriteriaIntroduction1}
                            </Description>
                            <Description>
                                {strings.sectionCriteriaIntroduction2}
                            </Description>
                            <Description>
                                {strings.sectionCriteriaComment2}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.overviewHeading}
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
                        numPreferredColumns={2}
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
                            readOnly={readOnly}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.formExpectedSubmissionTimeTitle}
                        description={strings.formExpectedSubmissionTimeDescription}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <DateInput
                            name="expected_submission_time"
                            value={getYearMonthFromFullDate(value?.expected_submission_time)}
                            error={error?.expected_submission_time}
                            onChange={onExpectedSubmissionTimeChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            type="month"
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
                            error={error?.objective}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
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
                            readOnly={readOnly}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.formContacts}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="lg"
                >
                    <Container
                        heading={strings.nationalHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.nSContact}
                                description={strings.nSContactDescription}
                                namePrefix="national_society_contact"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                            <InputSection
                                title={strings.partnerNS}
                                description={strings.partnerNSDescription}
                            >
                                <NonFieldError error={getErrorObject(error?.partner_contacts)} />
                                {value.partner_contacts?.map((contact, index) => (
                                    <PartnerContactsInput
                                        key={contact.client_id}
                                        index={index}
                                        value={contact}
                                        onChange={onPartnerContactChange}
                                        onRemove={onPartnerContactRemove}
                                        error={getErrorObject(error?.partner_contacts)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                ))}
                                <Button
                                    name={undefined}
                                    onClick={handlePartnerContactAdd}
                                    disabled={disabled || readOnly}
                                    before={<AddLineIcon />}
                                >
                                    {strings.addPartnerNSContactButton}
                                </Button>
                            </InputSection>
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.delegationHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.formFocalPoint}
                                namePrefix="ifrc_delegation_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                            <ContactInputsSection
                                title={strings.delegation}
                                namePrefix="ifrc_head_of_delegation"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                                withRequiredNameAndEmail
                            />
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.regionalHeader}
                        headingLevel={4}
                        variant="form"
                    >
                        <ListView
                            layout="block"
                            spacing="sm"
                        >
                            <ContactInputsSection
                                title={strings.drefFocalPoint}
                                description={strings.drefFocalPointDescription}
                                namePrefix="dref_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalFocalPoint}
                                namePrefix="ifrc_regional_focal_point"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalManager}
                                namePrefix="ifrc_regional_ops_manager"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalHead}
                                namePrefix="ifrc_regional_head_dcc"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <ContactInputsSection
                                title={strings.regionalCoordinator}
                                namePrefix="ifrc_global_ops_coordinator"
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </ListView>
                    </Container>
                </ListView>
            </Container>
            <Container
                heading={strings.stakeholderHeader}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.workWithGovernmentTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.workWithGovernmentTitle}
                                ariaLabel={strings.workWithGovernmentTitle}
                                title={strings.workWithGovernmentTitle}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Label strong>
                                            {strings.overviewExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.workExplanatoryNote}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.workWithGovernmentDescription}
                        withAsteriskOnTitle
                    >
                        <Container
                            withBorder
                            withPadding
                            spacing="sm"
                        >
                            <ListView layout="block">
                                <BooleanInput
                                    name="is_worked_with_government"
                                    value={value?.is_worked_with_government}
                                    onChange={setFieldValue}
                                    error={error?.is_worked_with_government}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                                {value.is_worked_with_government && (
                                    <TextArea
                                        label={strings.workWithGovernmentDescriptionLabel}
                                        name="worked_with_government_description"
                                        value={value?.worked_with_government_description}
                                        onChange={setFieldValue}
                                        error={error?.worked_with_government_description}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                )}
                            </ListView>
                        </Container>
                    </InputSection>
                    <InputSection
                        title={strings.keyActorsTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.keyActorsTitle}
                                ariaLabel={strings.keyActorsTitle}
                                title={strings.keyActorsTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.overviewExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.actorsExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.overviewRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.overviewRequiredPoint1}</li>
                                                    <li>{strings.overviewRequiredPoint2}</li>
                                                    <li>{strings.overviewRequiredPoint3}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <>
                                <div>
                                    {strings.keyActorsDescription}
                                </div>
                                <div>
                                    {resolveToString(
                                        strings.keyActorsDescription2,
                                        { addNewActorButtonLabel: strings.keyActorsAddButton },
                                    )}
                                </div>
                            </>
                        )}
                        withAsteriskOnTitle
                    >
                        <NonFieldError error={getErrorObject(error?.key_actors)} />
                        <ListView
                            layout="block"
                            spacing="sm"
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
                                    readOnly={readOnly}
                                />
                            ))}
                        </ListView>
                        <Button
                            name={undefined}
                            onClick={handleKeyActorsAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.keyActorsAddButton}
                        </Button>
                    </InputSection>
                    <InputSection
                        title={strings.technicalWorkingGroupsTitle}
                        description={strings.technicalWorkingGroupDescription}
                        withAsteriskOnTitle
                    >
                        <Container
                            withPadding
                            withBorder
                            spacing="sm"
                        >
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <BooleanInput
                                    name="is_technical_working_groups"
                                    value={value?.is_technical_working_groups}
                                    onChange={setFieldValue}
                                    error={error?.is_technical_working_groups}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                                {value.is_technical_working_groups && (
                                    <>
                                        <TextInput
                                            label={strings.technicalWorkingGroupsTitleLabel}
                                            name="technically_working_group_title"
                                            value={value?.technically_working_group_title}
                                            onChange={setFieldValue}
                                            error={error?.technically_working_group_title}
                                            disabled={!value?.is_technical_working_groups
                                                || disabled}
                                            readOnly={readOnly}
                                        />
                                        <TextArea
                                            label={strings.workWithGovernmentDescriptionLabel}
                                            name="technical_working_groups_in_place_description"
                                            value={value
                                                ?.technical_working_groups_in_place_description}
                                            onChange={setFieldValue}
                                            error={error
                                                ?.technical_working_groups_in_place_description}
                                            disabled={disabled}
                                            readOnly={readOnly}
                                            maxLength={charLimits
                                                .technical_working_groups_in_place_description}
                                        />
                                    </>
                                )}
                            </ListView>
                        </Container>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Overview;
