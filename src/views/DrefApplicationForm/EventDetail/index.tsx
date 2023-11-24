import {
    type Error,
    type EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { resolveUrl } from '#utils/resolveUrl';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import BooleanInput from '#components/BooleanInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import useTranslation from '#hooks/useTranslation';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link from '#components/Link';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import {
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
    TYPE_LOAN,
    ONSET_SUDDEN,
} from '../common';
import { type PartialDref } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialDref;
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

    const {
        error: formError,
        setFieldValue,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const operationalLearningPlatformUrl = resolveUrl(window.location.origin, 'preparedness#operational-learning');

    return (
        <div className={styles.eventDetail}>
            {value.type_of_dref !== TYPE_ASSESSMENT && value.type_of_dref !== TYPE_LOAN && (
                <Container
                    heading={strings.drefFormPreviousOperations}
                    className={styles.previousOperations}
                    headerDescription={(
                        <div className={styles.learningPlatformLink}>
                            {strings.drefOperationalLearningPlatformLabel}
                            <Link
                                href={operationalLearningPlatformUrl}
                                external
                                withUnderline
                                withLinkIcon
                            >
                                {strings.drefOperationalLearningPlatformLink}
                            </Link>
                        </div>
                    )}
                >
                    <InputSection
                        title={strings.drefFormAffectSameArea}
                    >
                        <BooleanInput
                            name="did_it_affect_same_area"
                            value={value.did_it_affect_same_area}
                            onChange={setFieldValue}
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
                                onChange={setFieldValue}
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
                                onChange={setFieldValue}
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
                                onChange={setFieldValue}
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
                {value.type_of_dref === TYPE_IMMINENT ? (
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
                {value.type_of_dref !== TYPE_LOAN && (
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
            </Container>
        </div>
    );
}

export default EventDetail;
