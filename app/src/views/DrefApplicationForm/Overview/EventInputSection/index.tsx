import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Description,
    InlineLayout,
    InputSection,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    listToMap,
    unique,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    removeNull,
} from '@togglecorp/toggle-form';
import sanitizeHtml from 'sanitize-html';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import EventSearchSelectInput, { type EventItem as EventSearchItem } from '#components/domain/EventSearchSelectInput';
import useAlert from '#hooks/useAlert';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import { type PartialDref } from '../../schema';

import i18n from './i18n.json';

type Value = PartialDref;
interface Props {
    value: Value;
    readOnly?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialDref>) => void;
    disabled?: boolean;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
    eventOptions: EventSearchItem[] | null | undefined;
    setEventOptions: Dispatch<SetStateAction<EventSearchItem[] | null | undefined>>;
}

function CopyEventSection(props: Props) {
    const {
        value,
        readOnly,
        setFieldValue,
        disabled,
        setDistrictOptions,
        eventOptions,
        setEventOptions,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const eventValue = value.event;

    const latestFieldReportId = useMemo(() => {
        if (isNotDefined(eventValue) || isNotDefined(eventOptions)) {
            return undefined;
        }
        const eventIdMap = listToMap(
            eventOptions,
            (item) => item.id,
        );

        return eventIdMap[eventValue]?.latest_field_report_id;
    }, [eventOptions, eventValue]);

    const onEventChange = useCallback((val: number | undefined) => {
        setFieldValue(val, 'event');
    }, [setFieldValue]);

    useRequest({
        skip: isNotDefined(eventValue),
        url: '/api/v2/event/mini/',
        query: {
            id: isDefined(eventValue) ? eventValue : undefined,
        },
        onSuccess: (response) => {
            setEventOptions(
                (oldOptions) => unique(
                    [...(oldOptions ?? []), ...response.results],
                    (option) => option.id,
                ),
            );
        },
    });

    const {
        pending: frDetailPending,
        trigger: triggerDetailRequest,
    } = useLazyRequest({
        url: '/api/v2/field-report/{id}/',
        pathVariables: isDefined(latestFieldReportId)
            ? { id: latestFieldReportId }
            : undefined,
        onSuccess: (rawFieldReportResponse) => {
            const fieldReportResponse = removeNull(rawFieldReportResponse);

            // const frDate = fieldReportResponse.created_at?.split('T')[0];
            // const go_field_report_date = value.go_field_report_date ?? frDate;
            const disaster_type = value.disaster_type ?? fieldReportResponse.dtype;
            const event_description = fieldReportResponse.description
                ? sanitizeHtml(
                    fieldReportResponse.description,
                    { allowedTags: [] },
                )
                : undefined;

            const un_or_other_actor = value.un_or_other_actor ?? fieldReportResponse.actions_others;
            const country = value.country ?? fieldReportResponse.countries[0];
            const national_society = value.national_society ?? country;

            const district = (value.district && value.district.length > 0)
                ? value.district
                : fieldReportResponse.districts;

            setDistrictOptions(((existingOptions) => {
                const safeOptions = existingOptions ?? [];
                return unique(
                    [...safeOptions, ...(fieldReportResponse.districts_details ?? [])],
                    (item) => item.id,
                );
            }));

            // NOTE: default value is false initially
            const government_assistance = fieldReportResponse.request_assistance
                ?? value?.government_requested_assistance;

            const num_affected = value?.num_affected
                ?? fieldReportResponse.num_affected
                ?? fieldReportResponse.gov_num_affected
                ?? fieldReportResponse.other_num_affected;

            const partner_national_society = value?.partner_national_society
                ?? fieldReportResponse.actions_taken?.find((a) => a.organization === 'PNS')?.summary;
            const ifrc = value?.ifrc
                ?? fieldReportResponse.actions_taken?.find((a) => a.organization === 'FDRN')?.summary;

            let {
                national_society_contact_name,
                national_society_contact_email,
                national_society_contact_phone_number,
                national_society_contact_title,
                ifrc_emergency_name,
                ifrc_emergency_email,
                ifrc_emergency_title,
                ifrc_emergency_phone_number,
                media_contact_name,
                media_contact_email,
                media_contact_title,
                media_contact_phone_number,
            } = value;

            if (
                isFalsyString(value.national_society_contact_name)
                && isFalsyString(value.national_society_contact_email)
                && isFalsyString(value.national_society_contact_title)
                && isFalsyString(value.national_society_contact_phone_number)
            ) {
                const nsContact = fieldReportResponse.contacts?.find(
                    (contact) => contact.ctype === 'NationalSociety',
                );
                if (nsContact) {
                    national_society_contact_name = nsContact.name;
                    national_society_contact_email = nsContact.email;
                    national_society_contact_phone_number = nsContact.phone;
                    national_society_contact_title = nsContact.title;
                }
            }

            if (
                isFalsyString(value.ifrc_emergency_name)
                && isFalsyString(value.ifrc_emergency_email)
                && isFalsyString(value.ifrc_emergency_title)
                && isFalsyString(value.ifrc_emergency_phone_number)
            ) {
                const federationContact = fieldReportResponse.contacts?.find(
                    (contact) => contact.ctype === 'Federation',
                );
                if (federationContact) {
                    ifrc_emergency_name = federationContact.name;
                    ifrc_emergency_email = federationContact.email;
                    ifrc_emergency_title = federationContact.title;
                    ifrc_emergency_phone_number = federationContact.phone;
                }
            }

            if (
                isFalsyString(value.media_contact_name)
                && isFalsyString(value.media_contact_email)
                && isFalsyString(value.media_contact_title)
                && isFalsyString(value.media_contact_phone_number)
            ) {
                const mediaContact = fieldReportResponse.contacts?.find(
                    (contact) => contact.ctype === 'Media',
                );
                if (mediaContact) {
                    media_contact_name = mediaContact.name;
                    media_contact_email = mediaContact.email;
                    media_contact_title = mediaContact.title;
                    media_contact_phone_number = mediaContact.phone;
                }
            }

            // setFieldValue(go_field_report_date, 'go_field_report_date');
            setFieldValue(disaster_type, 'disaster_type');
            setFieldValue(event_description, 'event_description');
            setFieldValue(un_or_other_actor, 'un_or_other_actor');
            setFieldValue(national_society_contact_name, 'national_society_contact_name');
            setFieldValue(national_society_contact_email, 'national_society_contact_email');
            setFieldValue(national_society_contact_phone_number, 'national_society_contact_phone_number');
            setFieldValue(national_society_contact_title, 'national_society_contact_title');
            setFieldValue(ifrc_emergency_name, 'ifrc_emergency_name');
            setFieldValue(ifrc_emergency_email, 'ifrc_emergency_email');
            setFieldValue(ifrc_emergency_phone_number, 'ifrc_emergency_phone_number');
            setFieldValue(ifrc_emergency_title, 'ifrc_emergency_title');
            setFieldValue(media_contact_name, 'media_contact_name');
            setFieldValue(media_contact_email, 'media_contact_email');
            setFieldValue(media_contact_phone_number, 'media_contact_phone_number');
            setFieldValue(media_contact_title, 'media_contact_title');
            setFieldValue(fieldReportResponse.event, 'event');
            setFieldValue(national_society, 'national_society');
            setFieldValue(country, 'country');
            setFieldValue(district, 'district');
            setFieldValue(num_affected, 'num_affected');
            setFieldValue(partner_national_society, 'partner_national_society');
            setFieldValue(ifrc, 'ifrc');
            setFieldValue(government_assistance, 'government_requested_assistance');

            // set field_report_option and districts

            alert.show(
                strings.drefFormCopyFRSuccessMessage,
                { variant: 'success' },
            );
        },
    });

    const handleCopyButtonClick = useCallback((fieldReportId: number | undefined | null) => {
        if (isNotDefined(fieldReportId)) {
            return;
        }
        triggerDetailRequest(null);
    }, [triggerDetailRequest]);

    return (
        <InputSection
            title={strings.drefFormEventDetailsTitle}
            description={strings.drefFormEventDescription}
        >
            <ListView layout="block">
                <InlineLayout
                    after={(
                        <Button
                            disabled={isNotDefined(latestFieldReportId)
                                || frDetailPending
                                || disabled
                                || readOnly}
                            onClick={handleCopyButtonClick}
                            name={eventValue}
                        >
                            {strings.drefFormCopyButtonLabel}
                        </Button>
                    )}
                >
                    <EventSearchSelectInput
                        name={undefined}
                        value={eventValue}
                        onChange={onEventChange}
                        countryId={value?.national_society}
                        options={eventOptions}
                        onOptionsChange={setEventOptions}
                        placeholder={strings.drefFormSelectFieldReportPlaceholder}
                        // nonClearable
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InlineLayout>
                {isDefined(eventValue) && isNotDefined(latestFieldReportId) && (
                    <Description
                        withLightText
                        textSize="sm"
                    >
                        {strings.noEventDetailsWarningMessage}
                    </Description>
                )}
            </ListView>
        </InputSection>
    );
}

export default CopyEventSection;
