import React from 'react';
import {
    PartialForm,
    Error,
    EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { listToMap } from '@togglecorp/fujs';

import { resolveUrl } from '#utils/resolveUrl';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import RadioInput from '#components/RadioInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import { BooleanValueOption } from '#types/common';
import useTranslation from '#hooks/useTranslation';
// import DREFFileInput from '#components/DREFFileInput';

import CaptionInput from '../CaptionInput';
import i18n from './i18n.json';
import {
    optionLabelSelector,
    booleanOptionKeySelector,
    DrefFields,
    FileWithCaption,
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
    TYPE_LOAN,
    ONSET_SUDDEN,
} from '../common';

import styles from './styles.module.css';

type Value = PartialForm<DrefFields>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    yesNoOptions: BooleanValueOption[];
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    drefType?: number;
    onsetType?: number;
}

function EventDetails(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        onValueChange,
        value,
        yesNoOptions,
        fileIdToUrlMap,
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setFileIdToUrlMap,
        drefType,
        onsetType,
    } = props;

    const error = getErrorObject(formError);
    // FIXME
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const imagesValue = React.useMemo(() => (
        value?.images_file?.map((d) => d.id).filter((d) => !!d) as number[] | undefined
    ), [value?.images_file]);

    const {
        setValue: onImageChange,
        removeValue: onImageRemove,
    } = useFormArray<'images_file', PartialForm<FileWithCaption>>(
        'images_file',
        onValueChange,
    );

    // FIXME
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleImageInputChange = React.useCallback((newValue: number[] | undefined) => {
        const imageCaptionByIdMap = listToMap(
            value?.images_file ?? [],
            (img) => img.id as number,
            (img) => img.caption,
        );

        const newImageList: undefined | PartialForm<FileWithCaption[]> = newValue?.map((v) => ({
            client_id: String(v),
            id: v,
            caption: imageCaptionByIdMap[v],
        }));

        onValueChange(newImageList, 'images_file' as const);
    }, [value?.images_file, onValueChange]);

    const operationalLearningPlatformUrl = resolveUrl(window.location.origin, 'preparedness#operational-learning');
    const isLoanDrefType = drefType === TYPE_LOAN;
    const isImminentDrefType = drefType === TYPE_IMMINENT;
    const isAssessmentDrefType = drefType === TYPE_ASSESSMENT;

    const eventDateByOnsetType = onsetType === ONSET_SUDDEN
        ? strings.drefFormEventDate : strings.drefFormSlowEventDate;

    return (
        <>
            {(!isAssessmentDrefType && !isLoanDrefType)
                && (
                    <Container
                        heading={strings.drefFormPreviousOperations}
                        className={styles.previousOperations}
                        headerDescription={(
                            <a
                                href={operationalLearningPlatformUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {strings.drefOperationalLearningPlatformLabel}
                            </a>
                        )}
                    >
                        <InputSection
                            title={strings.drefFormAffectSameArea}
                        >
                            <RadioInput
                                name="did_it_affect_same_area"
                                options={yesNoOptions}
                                keySelector={booleanOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.did_it_affect_same_area}
                                onChange={onValueChange}
                                error={error?.did_it_affect_same_area}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormAffectedthePopulationTitle}
                        >
                            <RadioInput
                                name="did_it_affect_same_population"
                                options={yesNoOptions}
                                keySelector={booleanOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.did_it_affect_same_population}
                                onChange={onValueChange}
                                error={error?.did_it_affect_same_population}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormNsRespond}
                        >
                            <RadioInput
                                name="did_ns_respond"
                                options={yesNoOptions}
                                keySelector={booleanOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.did_ns_respond}
                                onChange={onValueChange}
                                error={error?.did_ns_respond}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormNsRequestFund}
                        >
                            <RadioInput
                                name="did_ns_request_fund"
                                options={yesNoOptions}
                                keySelector={booleanOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.did_ns_request_fund}
                                onChange={onValueChange}
                                error={error?.did_ns_request_fund}
                            />
                        </InputSection>
                        {value.did_ns_request_fund && (
                            <InputSection
                                title={strings.drefFormNsFundingDetail}
                            >
                                <TextInput
                                    placeholder={strings.drefFormNsFundingDetailDescription}
                                    name="ns_request_text"
                                    value={value.ns_request_text}
                                    onChange={onValueChange}
                                    error={error?.ns_request_text}
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
                                        onChange={onValueChange}
                                        error={error?.dref_recurrent_text}
                                    />
                                </InputSection>
                            )
                        }
                        <InputSection
                            title={strings.drefFormLessonsLearnedTitle}
                            description={strings.drefFormLessonsLearnedDescription}
                            oneColumn
                            multiRow
                        >
                            <TextArea
                                name="lessons_learned"
                                onChange={onValueChange}
                                value={value.lessons_learned}
                                error={error?.lessons_learned}
                            />
                        </InputSection>
                    </Container>
                )}
            <Container
                heading={strings.drefFormDescriptionEvent}
            >
                <InputSection
                    title={(
                        drefType === TYPE_IMMINENT
                            ? strings.drefFormApproximateDateOfImpact
                            : eventDateByOnsetType
                    )}
                >
                    {drefType === TYPE_IMMINENT ? (
                        <TextArea
                            name="event_text"
                            value={value.event_text}
                            onChange={onValueChange}
                            error={error?.event_text}
                        />
                    ) : (
                        <DateInput
                            name="event_date"
                            value={value.event_date}
                            onChange={onValueChange}
                            error={error?.event_date}
                        />
                    )}
                </InputSection>
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={
                                drefType !== TYPE_IMMINENT
                                    ? strings.drefFormWhatWhereWhen
                                    : strings.drefFormImminentDisaster
                            }
                            oneColumn
                            multiRow
                        >
                            <TextArea
                                name="event_description"
                                onChange={onValueChange}
                                value={value.event_description}
                                error={error?.event_description}
                            />
                        </InputSection>
                    )}
                {drefType === TYPE_IMMINENT
                    && (
                        <InputSection
                            title={strings.drefFormTargetCommunities}
                            description={strings.drefFormTargetCommunitiesDescription}
                            oneColumn
                            multiRow
                        >
                            <TextArea
                                name="anticipatory_actions"
                                onChange={onValueChange}
                                value={value.anticipatory_actions}
                                error={error?.anticipatory_actions}
                            />
                        </InputSection>
                    )}
                {(isImminentDrefType && !isLoanDrefType) && (
                    <InputSection
                        title={strings.drefFormUploadSupportingDocument}
                        description={strings.drefFormUploadSupportingDocumentDescription}
                    >
                        {/*
                        <DREFFileInput
                            accept=".pdf, .docx, .pptx"
                            error={error?.supporting_document}
                            fileIdToUrlMap={fileIdToUrlMap}
                            name="supporting_document"
                            onChange={onValueChange}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            value={value.supporting_document}
                        >
                            {strings.drefFormUploadSupportingDocumentButtonLabel}
                        </DREFFileInput>
                        */}
                    </InputSection>
                )}
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={strings.drefFormUploadPhotos}
                            description={strings.drefFormUploadPhotosLimitation}
                            contentSectionClassName={styles.imageInputContent}
                        >
                            {/*
                            <DREFFileInput
                                name="images_file"
                                value={imagesValue}
                                onChange={handleImageInputChange}
                                accept="image/*"
                                multiple
                                error={error?.images_file}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                hidePreview
                            >
                                Select images
                            </DREFFileInput>
                            */}
                            <div className={styles.previewList}>
                                {value?.images_file?.map((g, i) => (
                                    <CaptionInput
                                        key={g.client_id}
                                        index={i}
                                        value={g}
                                        onChange={onImageChange}
                                        onRemove={onImageRemove}
                                        error={getErrorObject(error?.images_file)}
                                        fileIdToUrlMap={fileIdToUrlMap}
                                    />
                                ))}
                            </div>
                        </InputSection>
                    )}
                {(!isAssessmentDrefType && !isLoanDrefType)
                    && (
                        <InputSection
                            title={strings.drefFormScopeAndScaleEvent}
                            description={strings.drefFormScopeAndScaleDescription}
                            oneColumn
                            multiRow
                        >
                            <TextArea
                                name="event_scope"
                                onChange={onValueChange}
                                value={value.event_scope}
                                error={error?.event_scope}
                            />
                        </InputSection>
                    )}
            </Container>
        </>
    );
}

export default EventDetails;
