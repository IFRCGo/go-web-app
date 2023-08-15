import { useCallback, useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    Error,
    EntriesAsList,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import RadioInput from '#components/RadioInput';
import BooleanInput from '#components/BooleanInput';
import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput, { DisasterTypeItem } from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import EventElasticSearchSelectInput, { EventItem } from '#components/domain/EventElasticSearchSelectInput';
import useTranslation from '#hooks/useTranslation';

import {
    DISASTER_TYPE_EPIDEMIC,
    STATUS_EARLY_WARNING,
    STATUS_EVENT,
    type PartialFormValue,
    type ReportType,
    type Status,
} from '../common';

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
    titlePreview: string | undefined;
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
        titlePreview,
    } = props;

    const strings = useTranslation(i18n);

    const {
        api_field_report_status,
    } = useGlobalEnums();

    // FIXME: memoize this
    const statusOptions = api_field_report_status?.filter((item) => (
        item.key === STATUS_EARLY_WARNING || item.key === STATUS_EVENT
    ));

    // FIXME: memoize this
    const statusDescriptionSelector = ({ key }: { key: Status }) => {
        if (key === STATUS_EARLY_WARNING) {
            return strings.statusEarlyWarningDescription;
        }
        if (key === STATUS_EVENT) {
            return strings.statusEventDescription;
        }
        return '';
    };

    type MapByReportType = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        (val: Status, name: 'status') => {
            onValueChange(val, name);
            if (val === STATUS_EARLY_WARNING) {
                onValueChange(false, 'is_covid_report');
                if (value.dtype === DISASTER_TYPE_EPIDEMIC) {
                    onValueChange(undefined, 'dtype');
                }
            }
        },
        [onValueChange, value.dtype],
    );

    return (
        <Container
            // FIXME: use translation
            heading="Context"
            className={styles.contextFields}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.statusSectionTitle}
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
                title={strings.covidSectionTitle}
            >
                <BooleanInput
                    name="is_covid_report"
                    value={value.is_covid_report}
                    onChange={handleIsCovidReportChange}
                    error={error?.is_covid_report}
                    disabled={value.status === STATUS_EARLY_WARNING || disabled}
                />
            </InputSection>

            <InputSection
                // FIXME: use translations
                title="Search for existing emergency *"
                description="Type the name of the country you want to report on in the box above to begin the search."
            >
                <EventElasticSearchSelectInput
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
            >
                <CountrySelectInput
                    error={error?.country}
                    label={strings.countryInputLabel}
                    name="country"
                    onChange={handleCountryChange}
                    value={value.country}
                    disabled={disabled}
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
                twoColumn
            >
                <DisasterTypeSelectInput
                    name="dtype"
                    optionsFilter={(
                        value.status === STATUS_EARLY_WARNING
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
                twoColumn
            >
                <DateInput
                    name="start_date"
                    value={value.start_date}
                    onChange={onValueChange}
                    error={error?.start_date || disabled}
                />
            </InputSection>
            <InputSection
                title={strings.summaryLabel}
                description={strings.summaryDescription}
            >
                <TextInput
                    label={strings.titleSecondaryLabel}
                    placeholder={strings.titleInputPlaceholder}
                    name="summary"
                    value={value.summary}
                    maxLength={256}
                    onChange={onValueChange}
                    error={error?.summary}
                    disabled={disabled}
                    hint={titlePreview}
                />
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
