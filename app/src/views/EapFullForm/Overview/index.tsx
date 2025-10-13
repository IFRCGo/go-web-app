import { useCallback } from 'react';
import {
    AddLineIcon,
    CheckboxMultipleBlankFillIcon,
} from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    Heading,
    InlineLayout,
    InputSection,
    ListView,
    Modal,
    TextArea,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type PartialForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import ContactInputsSection from '#components/domain/ContactInputsSection';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type GoApiBody } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../schema';
import KeyActorsInput from './KeyActorsInput';
import PartnerContactsInput from './PartnerContactsInput';

import i18n from './i18n.json';

type EapRegisterRequestBody = GoApiBody<'/api/v2/eap-registration/', 'POST'>;
type RegistrationFormFields = PartialForm<EapRegisterRequestBody>;
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
    eapRegistrationDetail?: RegistrationFormFields;
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

    const [
        showQualityCriteria,
        {
            setTrue: setShowQualityCriteriaTrue,
            setFalse: setShowQualityCriteriaFalse,
        },
    ] = useBooleanState(false);

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
        <TabPage spacingOffset={-6}>
            <InlineLayout
                after={(
                    <Button
                        name={undefined}
                        onClick={setShowQualityCriteriaTrue}
                        after={(<CheckboxMultipleBlankFillIcon />)}
                    >
                        {strings.sectionCriteriaButtonLabel}
                    </Button>
                )}
            />
            <ListView
                layout="block"
                spacing="xs"
            >
                <Heading variant="form">
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
                        value={value?.expected_submission_time}
                        error={error?.expected_submission_time}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
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
            </ListView>
            <ListView
                layout="block"
                spacing="xs"
            >
                <Heading variant="form">
                    {strings.formContacts}
                </Heading>
                <>
                    <Heading
                        level={4}
                        variant="form"
                    >
                        {strings.nationalHeader}
                    </Heading>
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
                </>
                <>
                    <Heading
                        level={4}
                        variant="form"
                    >
                        {strings.delegationHeader}
                    </Heading>
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
                </>
                <>
                    <Heading
                        level={4}
                        variant="form"
                    >
                        {strings.regionalHeader}
                    </Heading>
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
                </>
            </ListView>
            <ListView
                layout="block"
                spacing="xs"
            >
                <Heading variant="form">
                    {strings.stakeholderHeader}
                </Heading>
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
                                        disabled={!value?.is_technical_working_groups || disabled}
                                        readOnly={readOnly}
                                    />
                                    <TextArea
                                        label={strings.workWithGovernmentDescriptionLabel}
                                        name="technical_working_groups_in_place_description"
                                        value={value?.technical_working_groups_in_place_description}
                                        onChange={setFieldValue}
                                        error={error?.technical_working_groups_in_place_description}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                </>
                            )}
                        </ListView>
                    </Container>
                </InputSection>
            </ListView>
            {showQualityCriteria && (
                <Modal
                    onClose={setShowQualityCriteriaFalse}
                    heading={strings.overviewSectionHeading}
                >
                    <ListView layout="block">
                        <TextOutput
                            label={(
                                <>
                                    {strings.sectionCriteriaIntroduction1}
                                    <br />
                                    {strings.sectionCriteriaIntroduction2}
                                </>
                            )}
                            value={strings.sectionCriteriaComment2}
                            strongLabel
                            withoutLabelColon
                        />
                    </ListView>
                </Modal>
            )}
        </TabPage>
    );
}

export default Overview;
