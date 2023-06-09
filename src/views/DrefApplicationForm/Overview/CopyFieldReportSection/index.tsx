import {
    useState,
    useCallback,
} from 'react';
import {
    unique,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { EntriesAsList } from '@togglecorp/toggle-form';
import sanitizeHtml from 'sanitize-html';

import Button from '#components/Button';
import InputSection from '#components/InputSection';
import useInputState from '#hooks/useInputState';
import useAlert from '#hooks/useAlert';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import type { paths } from '#generated/types';

import FieldReportSelectInput from '#components/FieldReportSearchSelectInput';
import type { FieldReportItem as FieldReportSearchItem } from '#components/FieldReportSearchSelectInput';

import type { PartialDref } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: use from '/api/v2/field_report/{id}/'
type GetFieldReport = paths['/api/v2/field_report/']['get'];
type FieldReportResponse = GetFieldReport['responses']['200']['content']['application/json'];
type FieldReportItem = Omit<NonNullable<FieldReportResponse['results']>[number], 'districts'> & {
    contacts: {
        ctype: string;
        name: string;
        email: string;
        title: string;
        phone: string;
    }[];
    districts: {
        id: number,
        name: string;
    }[];
};

type Value = PartialDref;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<PartialDref>) => void;
}

function CopyFieldReportSection(props: Props) {
    const {
        value,
        setFieldValue,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const [fieldReport, setFieldReport] = useInputState<number | undefined | null>(
        value?.field_report,
    );
    const [fetchedFieldReports, setFetchedFieldReports] = useState<
        FieldReportSearchItem[] | undefined | null
    >([]);

    useRequest<FieldReportItem>({
        skip: !value?.field_report,
        url: `api/v2/field_report/${value?.field_report}`,
        onSuccess: (fr) => {
            if (!fr) {
                return;
            }

            setFetchedFieldReports(
                (oldOptions) => unique([...(oldOptions ?? []), fr], (option) => option.id),
            );
        },
    });

    const {
        pending: frDetailPending,
        trigger: triggerDetailRequest,
    } = useLazyRequest<FieldReportItem, number>({
        url: (frId) => `api/v2/field_report/${frId}`,
        onSuccess: (fieldReportResponse) => {
            if (!fieldReportResponse) {
                alert.show(
                    strings.drefFormCopyFRFailureMessage,
                    { variant: 'danger' },
                );
                return;
            }

            // const frDate = fieldReportResponse.created_at?.split('T')[0];
            // const go_field_report_date = value.go_field_report_date ?? frDate;
            const disaster_type = value.disaster_type ?? fieldReportResponse.dtype?.id;
            const event_description = fieldReportResponse.description
                ? sanitizeHtml(
                    fieldReportResponse.description,
                    { allowedTags: [] },
                )
                : undefined;
            const un_or_other_actor = value.un_or_other_actor ?? fieldReportResponse.actions_others;
            const country = value.country ?? fieldReportResponse.countries[0]?.id;

            // TODO verify the following
            const district = (value.district && value.district.length > 0)
                ? value.district : fieldReportResponse.districts?.map((d) => d.id);
            const num_affected = value?.num_affected
                ?? fieldReportResponse.num_affected
                ?? fieldReportResponse.gov_num_affected
                ?? fieldReportResponse.other_num_affected;

            // FIXME: use constants
            const partner_national_society = value?.partner_national_society
                ?? fieldReportResponse.actions_taken?.find((a) => a.organization === 'PNS')?.summary;
            const ifrc = value?.ifrc ?? fieldReportResponse.actions_taken?.find((a) => a.organization === 'FDRN')?.summary;
            const icrc = value?.icrc ?? fieldReportResponse.actions_taken?.find((a) => a.organization === 'NTLS')?.summary;

            let {
                national_society_contact_name,
                national_society_contact_title,
                national_society_contact_email,
                national_society_contact_phone_number,
                ifrc_emergency_name,
                ifrc_emergency_title,
                ifrc_emergency_email,
                ifrc_emergency_phone_number,
                media_contact_name,
                media_contact_title,
                media_contact_email,
                media_contact_phone_number,
            } = value;

            if (!national_society_contact_name
                        && !national_society_contact_email
                    && !national_society_contact_title
                    && !national_society_contact_phone_number
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

            if (!ifrc_emergency_name
                           && !ifrc_emergency_email
                       && !ifrc_emergency_title
                       && !ifrc_emergency_phone_number
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

            if (!media_contact_name
                && !media_contact_email
                && !media_contact_title
                && !media_contact_phone_number
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
            if (isDefined(un_or_other_actor)) {
                setFieldValue(un_or_other_actor, 'un_or_other_actor');
            }
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

            if (isDefined(num_affected)) {
                setFieldValue(num_affected, 'num_affected');
            }

            if (isDefined(partner_national_society)) {
                setFieldValue(partner_national_society, 'partner_national_society');
            }

            if (isDefined(ifrc)) {
                setFieldValue(ifrc, 'ifrc');
            }

            if (isDefined(icrc)) {
                setFieldValue(icrc, 'icrc');
            }

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

        triggerDetailRequest(fieldReportId);
    }, [triggerDetailRequest]);

    return (
        <InputSection
            title={strings.drefFormEventDetailsTitle}
            description={strings.drefFormEventDescription}
        >
            <FieldReportSelectInput
                className={styles.region}
                name={undefined}
                value={fieldReport}
                onChange={setFieldReport}
                nationalSociety={value?.national_society}
                options={fetchedFieldReports}
                onOptionsChange={setFetchedFieldReports}
                placeholder={strings.drefFormSelectFieldReportPlaceholder}
                nonClearable
            />
            <div className={styles.actions}>
                <Button
                    variant="secondary"
                    disabled={isNotDefined(fieldReport) || frDetailPending}
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
