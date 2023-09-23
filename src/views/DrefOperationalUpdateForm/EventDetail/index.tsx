import {
    type Error,
    type EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import BooleanInput from '#components/BooleanInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import useTranslation from '#hooks/useTranslation';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import {
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
    TYPE_LOAN,
    ONSET_SUDDEN,
} from '../common';
import { type PartialOpsUpdate } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialOpsUpdate;
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

    return (
        <div className={styles.eventDetail}>
            {value.type_of_dref !== TYPE_LOAN && (
                <Container
                    heading={strings.drefOperationalUpdateSummaryChangeHeading}
                >
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingTimeFrame}
                    >
                        <BooleanInput
                            name="changing_timeframe_operation"
                            value={value.changing_timeframe_operation}
                            onChange={setFieldValue}
                            error={error?.changing_timeframe_operation}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingStrategy}
                    >
                        <BooleanInput
                            name="changing_operation_strategy"
                            value={value.changing_operation_strategy}
                            onChange={setFieldValue}
                            error={error?.changing_operation_strategy}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingTargetPopulation}
                    >
                        <BooleanInput
                            name="changing_target_population_of_operation"
                            value={value.changing_target_population_of_operation}
                            onChange={setFieldValue}
                            error={error?.changing_target_population_of_operation}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        // eslint-disable-next-line max-len
                        title={strings.drefOperationalUpdateSummaryAreYouChangingGeographicalLocation}
                    >
                        <BooleanInput
                            name="changing_geographic_location"
                            value={value.changing_geographic_location}
                            onChange={setFieldValue}
                            error={error?.changing_geographic_location}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingBudget}
                    >
                        <BooleanInput
                            name="changing_budget"
                            value={value.changing_budget}
                            onChange={setFieldValue}
                            error={error?.changing_budget}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryRequestForSecondAllocation}
                    >
                        <BooleanInput
                            name="request_for_second_allocation"
                            value={value.request_for_second_allocation}
                            onChange={setFieldValue}
                            error={error?.request_for_second_allocation}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateEventMaterialize}
                    >
                        <BooleanInput
                            name="has_forecasted_event_materialize"
                            value={value.has_forecasted_event_materialize}
                            onChange={setFieldValue}
                            error={error?.has_forecasted_event_materialize}
                            disabled={disabled}
                        />
                    </InputSection>
                    {/* eslint-disable-next-line max-len */}
                    {value.type_of_dref === TYPE_IMMINENT && value.has_forecasted_event_materialize && (
                        <InputSection
                            title={strings.drefOperationalUpdateEventMaterializeExplain}
                            // eslint-disable-next-line max-len
                            description={strings.drefOperationalUpdateEventMaterializeExplainDescription}
                        >
                            <TextArea
                                name="specified_trigger_met"
                                value={value.specified_trigger_met}
                                onChange={setFieldValue}
                                error={error?.specified_trigger_met}
                                placeholder={strings.drefOperationalUpdateSummaryExplain}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    <InputSection title={strings.drefOperationalUpdateSummaryExplain}>
                        <TextArea
                            name="summary_of_change"
                            value={value.summary_of_change}
                            onChange={setFieldValue}
                            error={error?.summary_of_change}
                            placeholder={strings.drefOperationalUpdateSummaryExplain}
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
                        numPreferredColumns={2}
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
                {value.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormUploadPhotos}
                        description={strings.drefFormUploadPhotosLimitation}
                        contentSectionClassName={styles.imageInputContent}
                    >
                        <MultiImageWithCaptionInput
                            label={strings.drefOperationalUpdateFormSelectImages}
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
