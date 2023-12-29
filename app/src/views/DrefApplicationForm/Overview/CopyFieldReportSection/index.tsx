import {
    type Dispatch,
    type SetStateAction,
    useCallback,
} from 'react';
import {
    Button,
    InputSection,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    removeNull,
} from '@togglecorp/toggle-form';
import sanitizeHtml from 'sanitize-html';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import FieldReportSearchSelectInput, { type FieldReportItem as FieldReportSearchItem } from '#components/domain/FieldReportSearchSelectInput';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import { type PartialDref } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialDref;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<PartialDref>) => void;
    disabled?: boolean;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
    fieldReportOptions: FieldReportSearchItem[] | null | undefined;
    setFieldReportOptions: Dispatch<SetStateAction<FieldReportSearchItem[] | null | undefined>>;
}

function CopyFieldReportSection(props: Props) {
    const {
        value,
        setFieldValue,
        disabled,
        setDistrictOptions,
        fieldReportOptions,
        setFieldReportOptions,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const [fieldReport, setFieldReport] = useInputState<number | undefined | null>(
        value?.field_report,
    );

    useRequest({
        skip: isNotDefined(value.field_report),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(value.field_report),
        },
        onSuccess: (fr) => {
            setFieldReportOptions(
                (oldOptions) => unique(
                    [...(oldOptions ?? []), fr],
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
        pathVariables: isDefined(fieldReport)
            ? { id: fieldReport }
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
            setFieldValue(fieldReportResponse.id, 'field_report');
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
            className={styles.copyFieldReportSection}
            title={strings.drefFormEventDetailsTitle}
            description={strings.drefFormEventDescription}
        >
            <div className={styles.content}>
                <FieldReportSearchSelectInput
                    className={styles.input}
                    name={undefined}
                    value={fieldReport}
                    onChange={setFieldReport}
                    nationalSociety={value?.national_society}
                    options={fieldReportOptions}
                    onOptionsChange={setFieldReportOptions}
                    placeholder={strings.drefFormSelectFieldReportPlaceholder}
                    nonClearable
                    disabled={disabled}
                />
                <Button
                    className={styles.action}
                    variant="secondary"
                    disabled={isNotDefined(fieldReport) || frDetailPending || disabled}
                    onClick={handleCopyButtonClick}
                    name={fieldReport}
                >
                    {strings.drefFormCopyButtonLabel}
                </Button>
            </div>
        </InputSection>
    );
}

export default CopyFieldReportSection;
