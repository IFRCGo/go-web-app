import { useCallback } from 'react';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    InputSection,
    NumberInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import SourceInformationInput from '#components/domain/SourceInformationInput';
import Link, { useLink } from '#components/Link';
import NonFieldError from '#components/NonFieldError';

import {
    ONSET_SUDDEN,
    TYPE_IMMINENT,
    TYPE_LOAN,
    TYPE_RESPONSE,
} from '../common';
import { type PartialDref } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialDref;
type SourceInformationFormFields = NonNullable<PartialDref['source_information']>[number];

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function EventDetail(props: Props) {
    const strings = useTranslation(i18n);

    const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
    const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
    const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

    const {
        error: formError,
        setFieldValue,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<'source_information', SourceInformationFormFields>(
        'source_information',
        setFieldValue,
    );

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => (
                [...(oldValue ?? []), newSourceInformationItem]
            ),
            'source_information' as const,
        );
    }, [setFieldValue]);

    const operationalLearningUrl = useLink({
        to: 'operationalLearning',
        external: false,
    });

    const handleDidItAffectSafeAreaChange = useCallback(
        (newValue: boolean | undefined) => {
            setFieldValue(newValue, 'did_it_affect_same_area');
            setFieldValue(undefined, 'did_it_affect_same_population');
            setFieldValue(undefined, 'did_ns_respond');
            setFieldValue(undefined, 'did_ns_request_fund');
            setFieldValue(undefined, 'ns_request_text');
        },
        [setFieldValue],
    );

    const handleDidItAffectSamePopulationChange = useCallback(
        (newValue: boolean | undefined) => {
            setFieldValue(newValue, 'did_it_affect_same_population');
            setFieldValue(undefined, 'did_ns_respond');
            setFieldValue(undefined, 'did_ns_request_fund');
            setFieldValue(undefined, 'ns_request_text');
        },
        [setFieldValue],
    );

    const handleDidNsRespondChange = useCallback(
        (newValue: boolean | undefined) => {
            setFieldValue(newValue, 'did_ns_respond');
            setFieldValue(undefined, 'did_ns_request_fund');
            setFieldValue(undefined, 'ns_request_text');
        },
        [setFieldValue],
    );

    const handleDidNsRequestFundChange = useCallback(
        (newValue: boolean | undefined) => {
            setFieldValue(newValue, 'did_ns_request_fund');
            setFieldValue(undefined, 'ns_request_text');
        },
        [setFieldValue],
    );

    return (
        <div className={styles.eventDetail}>
            {value.type_of_dref === TYPE_RESPONSE && (
                <Container
                    heading={strings.drefFormPreviousOperations}
                    className={styles.previousOperations}
                    headerDescription={(
                        resolveToComponent(
                            strings.drefOperationalLearningPlatformLabel,
                            {
                                clickHereLink: (
                                    <Link
                                        href={operationalLearningUrl.to}
                                        external
                                        withUnderline
                                        withLinkIcon
                                    >
                                        {strings.clickHereLinkLabel}
                                    </Link>
                                ),
                            },
                        )
                    )}
                >
                    <InputSection
                        title={strings.drefFormAffectSameArea}
                    >
                        <BooleanInput
                            name="did_it_affect_same_area"
                            value={value.did_it_affect_same_area}
                            onChange={handleDidItAffectSafeAreaChange}
                            error={error?.did_it_affect_same_area}
                            disabled={disabled}
                        />
                    </InputSection>
                    {value.did_it_affect_same_area && (
                        <InputSection
                            title={strings.drefFormAffectedThePopulationTitle}
                        >
                            <BooleanInput
                                name="did_it_affect_same_population"
                                value={value.did_it_affect_same_population}
                                onChange={handleDidItAffectSamePopulationChange}
                                error={error?.did_it_affect_same_population}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    {value.did_it_affect_same_population && (
                        <InputSection
                            title={strings.drefFormNsRespond}
                        >
                            <BooleanInput
                                name="did_ns_respond"
                                value={value.did_ns_respond}
                                onChange={handleDidNsRespondChange}
                                error={error?.did_ns_respond}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    {value.did_ns_respond && (
                        <InputSection
                            title={strings.drefFormNsRequestFund}
                        >
                            <BooleanInput
                                name="did_ns_request_fund"
                                value={value.did_ns_request_fund}
                                onChange={handleDidNsRequestFundChange}
                                error={error?.did_ns_request_fund}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    {value.did_ns_request_fund && (
                        <InputSection
                            title={strings.drefFormNsFundingDetail}
                        >
                            <TextInput
                                placeholder={strings.drefFormNsFundingDetailDescription}
                                name="ns_request_text"
                                value={value.ns_request_text}
                                onChange={setFieldValue}
                                error={error?.ns_request_text}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    {
                        value.did_ns_request_fund
                        && value.did_ns_respond
                        && value.did_it_affect_same_population
                        && value.did_it_affect_same_area && (
                            <InputSection
                                title={strings.drefFormRecurrentText}
                            >
                                <TextArea
                                    name="dref_recurrent_text"
                                    value={value.dref_recurrent_text}
                                    onChange={setFieldValue}
                                    error={error?.dref_recurrent_text}
                                    disabled={disabled}
                                />
                            </InputSection>
                        )
                    }
                    <InputSection
                        title={strings.drefFormLessonsLearnedTitle}
                        description={strings.drefFormLessonsLearnedDescription}
                    >
                        <TextArea
                            name="lessons_learned"
                            onChange={setFieldValue}
                            value={value.lessons_learned}
                            error={error?.lessons_learned}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefFormChildSafeguardingRiskAnalysisTitle}
                    >
                        <BooleanInput
                            name="complete_child_safeguarding_risk"
                            value={value.complete_child_safeguarding_risk}
                            onChange={setFieldValue}
                            error={error?.complete_child_safeguarding_risk}
                            disabled={disabled}
                        />
                        <TextArea
                            label={strings.drefFormChildSafeguardingRiskLevelLabel}
                            name="child_safeguarding_risk_level"
                            onChange={setFieldValue}
                            value={value.child_safeguarding_risk_level}
                            error={error?.child_safeguarding_risk_level}
                            disabled={disabled}
                        />
                    </InputSection>
                </Container>
            )}
            <Container
                heading={strings.drefFormDescriptionEvent}
            >
                {value.type_of_dref !== TYPE_IMMINENT && (
                    <InputSection
                        title={(
                            value.type_of_onset === ONSET_SUDDEN
                                ? strings.drefFormEventDate
                                : strings.drefFormSlowEventDate
                        )}
                    >
                        <DateInput
                            name="event_date"
                            value={value.event_date}
                            onChange={setFieldValue}
                            error={error?.event_date}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                <InputSection
                    title={strings.numericDetailsSectionTitle}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        name="num_affected"
                        label={value?.type_of_dref === TYPE_IMMINENT ? (
                            <>
                                {strings.drefFormRiskPeopleLabel}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={totalPopulationRiskImminentLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        ) : (
                            <>
                                {strings.drefFormPeopleAffected}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={totalPeopleAffectedSlowSuddenLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        value={value?.num_affected}
                        onChange={setFieldValue}
                        error={error?.num_affected}
                        hint={(
                            value?.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormPeopleAffectedDescriptionImminent
                                : strings.drefFormPeopleAffectedDescriptionSlowSudden
                        )}
                        disabled={disabled}
                    />
                    {value?.type_of_dref !== TYPE_LOAN && value?.type_of_dref !== TYPE_IMMINENT && (
                        <NumberInput
                            label={(
                                <>
                                    {strings.drefFormPeopleInNeed}
                                    <Link
                                        title={strings.drefFormClickEmergencyResponseFramework}
                                        href={peopleInNeedLink}
                                        external
                                    >
                                        <WikiHelpSectionLineIcon />
                                    </Link>
                                </>
                            )}
                            name="people_in_need"
                            value={value?.people_in_need}
                            onChange={setFieldValue}
                            error={error?.people_in_need}
                            hint={strings.drefFormPeopleInNeedDescriptionSlowSudden}
                            disabled={disabled}
                        />
                    )}
                    <NumberInput
                        name="estimated_number_of_affected_male"
                        label={strings.drefFormAffectedMaleLabel}
                        value={value?.estimated_number_of_affected_male}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_male}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_female"
                        label={strings.drefFormAffectedFemaleLabel}
                        value={value?.estimated_number_of_affected_female}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_female}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_girls_under_18"
                        label={strings.drefFormAffectedMinorGirlsLabel}
                        value={value?.estimated_number_of_affected_girls_under_18}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_girls_under_18}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_boys_under_18"
                        label={strings.drefFormAffectedMinorBoysLabel}
                        value={value?.estimated_number_of_affected_boys_under_18}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_boys_under_18}
                        disabled={disabled}
                    />
                    {/* NOTE: Empty div to preserve the layout */}
                    <div />
                </InputSection>
                {value.type_of_dref === TYPE_LOAN && (
                    <Container>
                        <InputSection
                            title={strings.drefFormRequestAmountForTypeLoan}
                            description={strings.drefFormRequestAmountDescriptionForTypeLoan}
                        >
                            <NumberInput
                                name="amount_requested"
                                value={value?.amount_requested}
                                onChange={setFieldValue}
                                error={error?.amount_requested}
                                disabled={disabled}
                            />
                        </InputSection>
                    </Container>
                )}
                {value.type_of_dref !== TYPE_LOAN && value.type_of_dref !== TYPE_IMMINENT && (
                    <InputSection
                        title={strings.drefFormWhatWhereWhen}
                        description={(
                            <>
                                <p>
                                    {strings.drefFormWhatWhereWhenDescriptionHeading}
                                </p>
                                <ol>
                                    <li>
                                        {strings.drefFormWhatWhereWhenDescriptionPoint1}
                                    </li>
                                    <li>
                                        {strings.drefFormWhatWhereWhenDescriptionPoint2}
                                    </li>
                                    <li>
                                        {strings.drefFormWhatWhereWhenDescriptionPoint3}
                                    </li>
                                </ol>
                            </>
                        )}
                    >
                        <TextArea
                            name="event_description"
                            onChange={setFieldValue}
                            value={value.event_description}
                            error={error?.event_description}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value.type_of_dref === TYPE_RESPONSE && (
                    <InputSection
                        title={strings.drefFormScopeAndScaleEvent}
                        description={strings.drefFormScopeAndScaleDescription}
                    >
                        <TextArea
                            name="event_scope"
                            onChange={setFieldValue}
                            value={value.event_scope}
                            error={error?.event_scope}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value.type_of_dref !== TYPE_LOAN && value.type_of_dref !== TYPE_IMMINENT && (
                    <>
                        <InputSection
                            title={strings.drefFormSourceInformationTitle}
                            description={strings.drefFormSourceInformationDescription}
                        >
                            <NonFieldError error={getErrorObject(error?.source_information)} />
                            {value.source_information?.map((source, index) => (
                                <SourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourceInformationChange}
                                    onRemove={onSourceInformationRemove}
                                    error={getErrorObject(error?.source_information)}
                                    disabled={disabled}
                                />
                            ))}
                            <div className={styles.actions}>
                                <Button
                                    name={undefined}
                                    onClick={handleSourceInformationAdd}
                                    variant="secondary"
                                    disabled={disabled}
                                >
                                    {strings.drefFormSourceInformationAddButton}
                                </Button>
                            </div>
                        </InputSection>
                        <InputSection
                            title={strings.drefFormUploadPhotos}
                            description={strings.drefFormUploadPhotosLimitation}
                            contentSectionClassName={styles.imageInputContent}
                        >
                            <MultiImageWithCaptionInput
                                label={strings.drefFormSelectImages}
                                url="/api/v2/dref-files/multiple/"
                                name="images_file"
                                value={value.images_file}
                                onChange={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={getErrorObject(error?.images_file)}
                                disabled={disabled}
                            />
                        </InputSection>
                    </>
                )}
                {value.type_of_dref === TYPE_IMMINENT && (
                    <>
                        <InputSection
                            title={strings.drefHazardExpectedTitle}
                        >
                            <DateInput
                                name="hazard_date"
                                onChange={setFieldValue}
                                value={value.hazard_date}
                                error={error?.hazard_date}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefHazardTitle}
                            description={strings.drefHazardDescription}
                        >
                            <TextArea
                                name="hazard_vulnerabilities_and_risks"
                                onChange={setFieldValue}
                                value={value.hazard_vulnerabilities_and_risks}
                                error={error?.hazard_vulnerabilities_and_risks}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormSourceInformationTitle}
                            description={strings.drefFormSourceInformationDescription}
                        >
                            <NonFieldError error={getErrorObject(error?.source_information)} />
                            {value.source_information?.map((source, index) => (
                                <SourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourceInformationChange}
                                    onRemove={onSourceInformationRemove}
                                    error={getErrorObject(error?.source_information)}
                                    disabled={disabled}
                                />
                            ))}
                            <div className={styles.actions}>
                                <Button
                                    name={undefined}
                                    onClick={handleSourceInformationAdd}
                                    variant="secondary"
                                    disabled={disabled}
                                >
                                    {strings.drefFormSourceInformationAddButton}
                                </Button>
                            </div>
                        </InputSection>
                        <InputSection
                            title={strings.drefFormUploadSupportingDocument}
                        >
                            <GoSingleFileInput
                                name="scenario_analysis_supporting_document"
                                accept=".pdf, .docx, .pptx"
                                fileIdToUrlMap={fileIdToUrlMap}
                                onChange={setFieldValue}
                                url="/api/v2/dref-files/"
                                value={value.scenario_analysis_supporting_document}
                                error={error?.scenario_analysis_supporting_document}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                clearable
                                disabled={disabled}
                            >
                                {strings.drefFormUploadSupportingDocumentButton}
                            </GoSingleFileInput>
                        </InputSection>
                    </>
                )}
            </Container>
        </div>
    );
}

export default EventDetail;
