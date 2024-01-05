import { useCallback } from 'react';
import {
    type Error,
    type EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import BooleanInput from '#components/BooleanInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link, { useLink } from '#components/Link';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import {
    ONSET_SUDDEN,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
    TYPE_RESPONSE,
} from '../common';
import { type PartialDref } from '../schema';

import SourceInformationInput from './SourceInformationInput';
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
    const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
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
        to: 'preparednessGlobalOperational',
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
            {value.type_of_dref !== TYPE_ASSESSMENT && value.type_of_dref !== TYPE_LOAN && (
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
                </Container>
            )}
            <Container
                heading={strings.drefFormDescriptionEvent}
            >
                {value.type_of_dref === TYPE_IMMINENT || value.type_of_dref === TYPE_RESPONSE ? (
                    <InputSection
                        title={strings.drefFormApproximateDateOfImpact}
                    >
                        <TextArea
                            name="event_text"
                            value={value.event_text}
                            onChange={setFieldValue}
                            error={error?.event_text}
                            disabled={disabled}
                        />
                    </InputSection>
                ) : (
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
                                {/* FIXME: use string template */}
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
                                {/* FIXME: use string template */}
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
                    {value?.type_of_dref !== TYPE_LOAN && (
                        <NumberInput
                            label={(
                                <>
                                    {/* FIXME: use string template */}
                                    {
                                        value?.type_of_dref === TYPE_IMMINENT
                                            ? strings.drefFormEstimatedPeopleInNeed
                                            : strings.drefFormPeopleInNeed
                                    }
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
                            hint={(
                                value?.type_of_dref === TYPE_IMMINENT
                                    ? strings.drefFormPeopleInNeedDescriptionImminent
                                    : strings.drefFormPeopleInNeedDescriptionSlowSudden
                            )}
                            disabled={disabled}
                        />
                    )}
                    {/* FIXME: use grid to fix the empty div issue */}
                    {/* NOTE: Empty div to preserve the layout */}
                    <div />
                </InputSection>
                {value.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={
                            value.type_of_dref !== TYPE_IMMINENT
                                ? strings.drefFormWhatWhereWhen
                                : strings.drefFormImminentDisaster
                        }
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
                {value.type_of_dref === TYPE_IMMINENT && (
                    <InputSection
                        title={strings.drefFormTargetCommunities}
                        description={strings.drefFormTargetCommunitiesDescription}
                    >
                        <TextArea
                            name="anticipatory_actions"
                            onChange={setFieldValue}
                            value={value.anticipatory_actions}
                            error={error?.anticipatory_actions}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value.type_of_dref === TYPE_IMMINENT && (
                    <InputSection
                        title={strings.drefFormUploadSupportingDocument}
                        description={strings.drefFormUploadSupportingDocumentDescription}
                    >
                        <GoSingleFileInput
                            name="supporting_document"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/dref-files/"
                            value={value.supporting_document}
                            error={error?.supporting_document}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                        >
                            {strings.drefFormUploadSupportingDocumentButtonLabel}
                        </GoSingleFileInput>
                    </InputSection>
                )}
                {value.type_of_dref !== TYPE_ASSESSMENT && value.type_of_dref !== TYPE_LOAN && (
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
                {value.type_of_dref !== TYPE_LOAN && (
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
            </Container>
        </div>
    );
}

export default EventDetail;
