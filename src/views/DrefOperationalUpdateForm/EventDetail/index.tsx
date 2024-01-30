import { useCallback } from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    type Error,
    type EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import BooleanInput from '#components/BooleanInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import NumberInput from '#components/NumberInput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';
import SourceInformationInput from '#views/DrefApplicationForm/EventDetail/SourceInformationInput';
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
type SourceInformationFormFields = NonNullable<PartialOpsUpdate['source_information']>[number];

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

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
                <InputSection
                    title={strings.numericDetails}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        name="number_of_people_affected"
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
                        value={value?.number_of_people_affected}
                        onChange={setFieldValue}
                        error={error?.number_of_people_affected}
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
                    <NumberInput
                        label={(
                            <>
                                {strings.drefFormPeopleTargeted}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={peopleTargetedLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        name="number_of_people_targeted"
                        value={value?.number_of_people_targeted}
                        onChange={setFieldValue}
                        error={error?.number_of_people_targeted}
                        hint={strings.drefFormPeopleTargetedDescription}
                        disabled={disabled}
                    />
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
                {value.type_of_dref !== TYPE_LOAN && (
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
                        <Button
                            className={styles.actions}
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            variant="secondary"
                            disabled={disabled}
                        >
                            {strings.drefFormSourceInformationAddButton}
                        </Button>
                    </InputSection>
                )}
            </Container>
        </div>
    );
}

export default EventDetail;
