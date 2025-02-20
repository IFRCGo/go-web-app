import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    BooleanInput,
    Container,
    DateInput,
    InputSection,
    RadioInput,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput, { type DisasterTypeItem } from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import EventSearchSelectInput, { type EventItem } from '#components/domain/EventSearchSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    DISASTER_TYPE_EPIDEMIC,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
    type FieldReportStatusEnum,
    type ReportType,
} from '#utils/constants';

import { type PartialFormValue } from '../common';
import TitlePreview from './TitlePreview';

import i18n from './i18n.json';
import styles from './styles.module.css';

function isNotEpidemic(o: DisasterTypeItem) {
    return o.id !== DISASTER_TYPE_EPIDEMIC;
}

interface Props {
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    reportType: ReportType;
    districtOptions: DistrictItem[] | null | undefined;
    eventOptions: EventItem[] | null | undefined;
    setDistrictOptions: React.Dispatch<React.SetStateAction<DistrictItem[] | null | undefined>>;
    setEventOptions: React.Dispatch<React.SetStateAction<EventItem[] | null | undefined>>;
    disabled?: boolean;
}

function ContextFields(props: Props) {
    const {
        districtOptions,
        error: formError,
        onValueChange,
        value,
        reportType,
        eventOptions,
        setDistrictOptions,
        setEventOptions,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        api_field_report_status,
    } = useGlobalEnums();

    const statusOptions = useMemo(() => api_field_report_status?.filter((item) => (
        item.key === FIELD_REPORT_STATUS_EARLY_WARNING || item.key === FIELD_REPORT_STATUS_EVENT
    )) || [], [api_field_report_status]);

    const statusDescriptionSelector = useMemo(() => ({ key }: { key: FieldReportStatusEnum }) => {
        if (key === FIELD_REPORT_STATUS_EARLY_WARNING) {
            return strings.statusEarlyWarningDescription;
        }
        if (key === FIELD_REPORT_STATUS_EVENT) {
            return strings.statusEventDescription;
        }
        return '';
    }, [
        strings.statusEarlyWarningDescription,
        strings.statusEventDescription,
    ]);

    type MapByReportType = {

        [key in ReportType]: string | undefined;
    }

    const startDateDescriptionMap: MapByReportType = {
        EW: strings.startDateDescriptionEW,
        COVID: strings.startDateDescriptionEPI,
        EPI: strings.startDateDescriptionEPI,
        EVT: strings.startDateDescriptionEVT,
    };

    const startDateTitleMap: MapByReportType = {
        EW: strings.startDateLabelEW,
        COVID: strings.startDateLabelEPI,
        EPI: strings.startDateLabelEPI,
        EVT: strings.startDateLabelStartDate,
    };

    const countryTitleMap: MapByReportType = {
        EW: strings.countryLabelEW,
        COVID: strings.countryLabelAffected,
        EPI: strings.countryLabelAffected,
        EVT: strings.countryLabelAffected,
    };

    const countryDescriptionMap: MapByReportType = {
        EW: strings.countryDescriptionEW,
        COVID: undefined,
        EPI: undefined,
        EVT: undefined,
    };

    const startDateSectionDescription = startDateDescriptionMap[reportType];
    const startDateSectionTitle = startDateTitleMap[reportType];
    const countrySectionTitle = countryTitleMap[reportType];
    const countrySectionDescription = countryDescriptionMap[reportType];

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const handleCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            onValueChange(val, name);
            onValueChange(undefined, 'districts');
        },
        [onValueChange],
    );

    const handleIsCovidReportChange = useCallback(
        (val: boolean, name: 'is_covid_report') => {
            onValueChange(val, name);
            onValueChange(DISASTER_TYPE_EPIDEMIC, 'dtype');
        },
        [onValueChange],
    );

    const handleStatusChange = useCallback(
        (val: FieldReportStatusEnum, name: 'status') => {
            onValueChange(val, name);
            if (val === FIELD_REPORT_STATUS_EARLY_WARNING) {
                onValueChange(false, 'is_covid_report');
                if (value.dtype === DISASTER_TYPE_EPIDEMIC) {
                    onValueChange(undefined, 'dtype');
                }
            }
        },
        [onValueChange, value.dtype],
    );

    const summaryVisible = !value.is_covid_report;

    return (
        <Container
            heading={strings.fieldReportFormContextTitle}
            className={styles.contextFields}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.statusSectionTitle}
                withAsteriskOnTitle
            >
                <RadioInput
                    name="status"
                    options={statusOptions}
                    // FIXME: do not use inline functions
                    keySelector={(d) => d.key}
                    labelSelector={(d) => d.value}
                    descriptionSelector={statusDescriptionSelector}
                    value={value.status}
                    error={error?.status}
                    onChange={handleStatusChange}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                className={styles.hidden}
                title={strings.covidSectionTitle}
                withAsteriskOnTitle
            >
                <BooleanInput
                    name="is_covid_report"
                    value={value.is_covid_report}
                    onChange={handleIsCovidReportChange}
                    error={error?.is_covid_report}
                    disabled={value.status === FIELD_REPORT_STATUS_EARLY_WARNING || disabled}
                />
            </InputSection>

            <InputSection
                title={strings.fieldReportFormSearchTitle}
                description={strings.fieldReportFormSearchDescription}
            >
                <EventSearchSelectInput
                    label={strings.emergencySelectLabel}
                    placeholder={strings.emergencySelectPlaceholder}
                    name="event"
                    value={value.event}
                    onChange={onValueChange}
                    error={error?.event}
                    options={eventOptions}
                    onOptionsChange={setEventOptions}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={countrySectionTitle}
                description={countrySectionDescription}
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <CountrySelectInput
                    error={error?.country}
                    label={strings.countryInputLabel}
                    name="country"
                    onChange={handleCountryChange}
                    value={value.country}
                    disabled={disabled}
                    withAsterisk
                />
                <DistrictSearchMultiSelectInput
                    error={getErrorString(error?.districts)}
                    label={strings.districtInputLabel}
                    name="districts"
                    disabled={isNotDefined(value.country) || disabled}
                    countryId={value?.country}
                    onChange={onValueChange}
                    options={districtOptions}
                    onOptionsChange={setDistrictOptions}
                    value={value.districts}
                />
            </InputSection>
            <InputSection
                title={strings.disasterTypeLabel}
                description={strings.disasterTypeDescription}
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <DisasterTypeSelectInput
                    name="dtype"
                    optionsFilter={(
                        value.status === FIELD_REPORT_STATUS_EARLY_WARNING
                            ? isNotEpidemic
                            : undefined
                    )}
                    value={value.dtype}
                    onChange={onValueChange}
                    error={error?.dtype}
                    disabled={value.is_covid_report || disabled}
                />
            </InputSection>
            <InputSection
                title={startDateSectionTitle}
                description={startDateSectionDescription}
                numPreferredColumns={2}
                withAsteriskOnTitle
            >
                <DateInput
                    name="start_date"
                    value={value.start_date}
                    onChange={onValueChange}
                    error={error?.start_date || disabled}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.summaryLabel}
                description={strings.summaryDescription}
                withAsteriskOnTitle
                numPreferredColumns={1}
            >
                {summaryVisible && (
                    <>
                        <TextInput
                            label={strings.titleSecondaryLabel}
                            placeholder={strings.titleInputPlaceholder}
                            name="title"
                            value={value.title}
                            maxLength={256}
                            onChange={onValueChange}
                            error={error?.title}
                            disabled={disabled}
                            withAsterisk
                        />
                        {isDefined(value.country)
                            && isDefined(value.dtype)
                            && isDefined(value.title)
                            && isTruthyString(value.title.trim())
                            ? (
                                <TitlePreview
                                    country={value.country}
                                    disasterType={value.dtype}
                                    event={value.event}
                                    isCovidReport={value.is_covid_report}
                                    startDate={value.start_date}
                                    title={value.title}
                                    id={value.id}
                                />
                            ) : (
                                <TextOutput
                                    value={value.summary}
                                    label={isDefined(fieldReportId)
                                        ? strings.originalTitle : strings.generatedTitlePreview}
                                    strongLabel
                                />
                            )}
                    </>
                )}
            </InputSection>
            <InputSection
                title={strings.assistanceLabel}
                description={strings.assistanceDescription}
            >
                <BooleanInput
                    name="request_assistance"
                    value={value.request_assistance}
                    onChange={onValueChange}
                    error={error?.request_assistance}
                    disabled={disabled}
                    clearable
                />
            </InputSection>
            <InputSection
                title={strings.nsAssistanceLabel}
                description={strings.nsAssistanceDescription}
            >
                <BooleanInput
                    name="ns_request_assistance"
                    value={value.ns_request_assistance}
                    onChange={onValueChange}
                    error={error?.ns_request_assistance}
                    disabled={disabled}
                    clearable
                />
            </InputSection>
        </Container>
    );
}

export default ContextFields;
