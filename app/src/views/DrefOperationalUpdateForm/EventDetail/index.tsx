import { useCallback } from 'react';
import {
    ErrorWarningFillIcon,
    WikiHelpSectionLineIcon,
} from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    InputSection,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import SourceInformationInput from '#components/domain/SourceInformationInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';

import {
    ONSET_SUDDEN,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
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
    readOnly: boolean;
    disabled?: boolean;
    operationTimeframeWarning: string | undefined;
    budgetWarning: string | undefined;
    geoWarning: string | undefined;
    peopleTargetedWarning: string | undefined;
}

const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

function EventDetail(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        setFieldValue,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
        disabled,
        operationTimeframeWarning,
        budgetWarning,
        geoWarning,
        peopleTargetedWarning,
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
                        <div>
                            <BooleanInput
                                name="changing_timeframe_operation"
                                value={value.changing_timeframe_operation}
                                onChange={setFieldValue}
                                error={error?.changing_timeframe_operation}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                            {operationTimeframeWarning && (
                                <div className={styles.warning}>
                                    <ErrorWarningFillIcon className={styles.icon} />
                                    {operationTimeframeWarning}
                                </div>
                            )}
                        </div>
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingStrategy}
                    >
                        <BooleanInput
                            name="changing_operation_strategy"
                            value={value.changing_operation_strategy}
                            onChange={setFieldValue}
                            error={error?.changing_operation_strategy}
                            readOnly={readOnly}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingTargetPopulation}
                    >
                        <div>
                            <BooleanInput
                                name="changing_target_population_of_operation"
                                value={value.changing_target_population_of_operation}
                                onChange={setFieldValue}
                                error={error?.changing_target_population_of_operation}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                            {peopleTargetedWarning && (
                                <div className={styles.warning}>
                                    <ErrorWarningFillIcon className={styles.icon} />
                                    {peopleTargetedWarning}
                                </div>
                            )}
                        </div>
                    </InputSection>
                    <InputSection
                        // eslint-disable-next-line max-len
                        title={strings.drefOperationalUpdateSummaryAreYouChangingGeographicalLocation}
                    >
                        <div>
                            <BooleanInput
                                name="changing_geographic_location"
                                value={value.changing_geographic_location}
                                onChange={setFieldValue}
                                error={error?.changing_geographic_location}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                            {geoWarning && (
                                <div className={styles.warning}>
                                    <ErrorWarningFillIcon className={styles.icon} />
                                    {geoWarning}
                                </div>
                            )}
                        </div>
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryAreYouChangingBudget}
                    >
                        <div>
                            <BooleanInput
                                name="changing_budget"
                                value={value.changing_budget}
                                onChange={setFieldValue}
                                error={error?.changing_budget}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                            {budgetWarning && (
                                <div className={styles.warning}>
                                    <ErrorWarningFillIcon className={styles.icon} />
                                    {budgetWarning}
                                </div>
                            )}
                        </div>
                    </InputSection>
                    <InputSection
                        title={strings.drefOperationalUpdateSummaryRequestForSecondAllocation}
                    >
                        <BooleanInput
                            name="request_for_second_allocation"
                            value={value.request_for_second_allocation}
                            onChange={setFieldValue}
                            error={error?.request_for_second_allocation}
                            readOnly={readOnly}
                            disabled={disabled}
                        />
                    </InputSection>
                    {value.type_of_dref === TYPE_IMMINENT && (
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
                                readOnly={readOnly}
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                        readOnly={readOnly}
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
                            readOnly={readOnly}
                            disabled={disabled}
                        />
                    )}
                    <NumberInput
                        name="estimated_number_of_affected_male"
                        label={strings.drefFormAffectedMaleLabel}
                        value={value?.estimated_number_of_affected_male}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_male}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_female"
                        label={strings.drefFormAffectedFemaleLabel}
                        value={value?.estimated_number_of_affected_female}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_female}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_girls_under_18"
                        label={strings.drefFormAffectedMinorGirlsLabel}
                        value={value?.estimated_number_of_affected_girls_under_18}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_girls_under_18}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <NumberInput
                        name="estimated_number_of_affected_boys_under_18"
                        label={strings.drefFormAffectedMinorBoysLabel}
                        value={value?.estimated_number_of_affected_boys_under_18}
                        onChange={setFieldValue}
                        error={error?.estimated_number_of_affected_boys_under_18}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    {/* NOTE: Empty div to preserve the layout */}
                    <div />
                </InputSection>
                {value.type_of_dref === TYPE_LOAN && (
                    <Container>
                        <InputSection
                            title={strings.drefOperationalUpdateAllocationSoFarForTypeLoan}
                        >
                            <NumberInput
                                name="total_dref_allocation"
                                value={value?.total_dref_allocation}
                                onChange={setFieldValue}
                                error={error?.total_dref_allocation}
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                    </Container>
                )}
                {value.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={
                            value.type_of_dref !== TYPE_IMMINENT
                                ? strings.drefFormWhatWhereWhen
                                : strings.drefFormImminentDisaster
                        }
                        description={value.type_of_dref !== TYPE_IMMINENT && (
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
                            disabled={disabled}
                            useCurrentLanguageForMutation
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
                            readOnly={readOnly}
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
                                readOnly={readOnly}
                                disabled={disabled}
                            />
                        ))}
                        <Button
                            className={styles.actions}
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            variant="secondary"
                            disabled={disabled || readOnly}
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
