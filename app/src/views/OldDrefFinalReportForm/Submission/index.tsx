import { useCallback } from 'react';
import {
    Container,
    DateInput,
    InputSection,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    addNumMonthsToDate,
    encodeDate,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type PartialFinalReport } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialFinalReport;

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    disabled?: boolean;
}

function Submission(props: Props) {
    const {
        error: formError,
        setFieldValue,
        value,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const handleTotalOperationTimeframeChange = useCallback(
        (val: number | undefined, name: 'total_operation_timeframe') => {
            setFieldValue(val, name);
            const endDate = addNumMonthsToDate(
                value.operation_start_date,
                val,
            );
            if (isDefined(endDate)) {
                setFieldValue(encodeDate(endDate), 'operation_end_date');
            }
        },
        [setFieldValue, value.operation_start_date],
    );

    const handleOperationStartDateChange = useCallback(
        (val: string | undefined, name: 'operation_start_date') => {
            setFieldValue(val, name);
            const endDate = addNumMonthsToDate(
                val,
                value.total_operation_timeframe,
            );
            if (isDefined(endDate)) {
                setFieldValue(encodeDate(endDate), 'operation_end_date');
            }
        },
        [setFieldValue, value.total_operation_timeframe],
    );

    return (
        <div className={styles.submission}>
            <Container
                heading={strings.drefFormOperationalTimeframes}
                className={styles.operationalTimeframes}
            >
                <InputSection
                    withoutTitleSection
                    numPreferredColumns={2}
                >
                    <DateInput
                        label={strings.finalReportStartOfOperation}
                        name="operation_start_date"
                        value={value.operation_start_date}
                        onChange={handleOperationStartDateChange}
                        error={error?.operation_start_date}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.finalReportTotalOperatingTimeFrame}
                        name="total_operation_timeframe"
                        value={value.total_operation_timeframe}
                        onChange={handleTotalOperationTimeframeChange}
                        error={error?.total_operation_timeframe}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    withoutTitleSection
                    numPreferredColumns={2}
                >
                    <DateInput
                        label={strings.finalReportEndOfOperation}
                        name="operation_end_date"
                        value={value.operation_end_date}
                        onChange={setFieldValue}
                        error={error?.operation_end_date}
                        disabled={disabled}
                        readOnly
                    />
                    <DateInput
                        label={strings.finalReportDateOfPublication}
                        name="date_of_publication"
                        value={value.date_of_publication}
                        onChange={setFieldValue}
                        error={error?.date_of_publication}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>

            <Container
                heading={strings.drefFormTrackingData}
                className={styles.trackingData}
            >
                <InputSection
                    title={strings.drefFormAppealCode}
                    description={strings.drefFormAppealCodeDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        name="appeal_code"
                        value={value.appeal_code}
                        onChange={setFieldValue}
                        error={error?.appeal_code}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormGlideNum}
                    numPreferredColumns={2}
                >
                    <TextInput
                        name="glide_code"
                        value={value.glide_code}
                        onChange={setFieldValue}
                        error={error?.glide_code}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormAppealManager}
                    description={strings.drefFormAppealManagerDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="ifrc_appeal_manager_name"
                        value={value.ifrc_appeal_manager_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="ifrc_appeal_manager_title"
                        value={value.ifrc_appeal_manager_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="ifrc_appeal_manager_email"
                        value={value.ifrc_appeal_manager_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="ifrc_appeal_manager_phone_number"
                        value={value.ifrc_appeal_manager_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormProjectManager}
                    description={strings.drefFormProjectManagerDescription}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="ifrc_project_manager_name"
                        value={value.ifrc_project_manager_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="ifrc_project_manager_title"
                        value={value.ifrc_project_manager_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="ifrc_project_manager_email"
                        value={value.ifrc_project_manager_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="ifrc_project_manager_phone_number"
                        value={value.ifrc_project_manager_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalSocietyContact}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="national_society_contact_name"
                        value={value.national_society_contact_name}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="national_society_contact_title"
                        value={value.national_society_contact_title}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="national_society_contact_email"
                        value={value.national_society_contact_email}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="national_society_contact_phone_number"
                        value={value.national_society_contact_phone_number}
                        onChange={setFieldValue}
                        error={error?.national_society_contact_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormIfrcEmergency}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="ifrc_emergency_name"
                        value={value.ifrc_emergency_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_emergency_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="ifrc_emergency_title"
                        value={value.ifrc_emergency_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_emergency_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="ifrc_emergency_email"
                        value={value.ifrc_emergency_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_emergency_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="ifrc_emergency_phone_number"
                        value={value.ifrc_emergency_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_emergency_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormDrefRegionalPoint}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormFocalPointNameLabel}
                        name="regional_focal_point_name"
                        value={value.regional_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormFocalPointTitleLabel}
                        name="regional_focal_point_title"
                        value={value.regional_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromFocalPointEmailLabel}
                        name="regional_focal_point_email"
                        value={value.regional_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromFocalPointPhoneNumberLabel}
                        name="regional_focal_point_phone_number"
                        value={value.regional_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormMediaContact}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="media_contact_name"
                        value={value.media_contact_name}
                        onChange={setFieldValue}
                        error={error?.media_contact_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="media_contact_title"
                        value={value.media_contact_title}
                        onChange={setFieldValue}
                        error={error?.media_contact_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="media_contact_email"
                        value={value.media_contact_email}
                        onChange={setFieldValue}
                        error={error?.media_contact_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="media_contact_phone_number"
                        value={value.media_contact_phone_number}
                        onChange={setFieldValue}
                        error={error?.media_contact_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalSocietyIntegrityTitle}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormIntegrityContactNameLabel}
                        name="national_society_integrity_contact_name"
                        value={value.national_society_integrity_contact_name}
                        onChange={setFieldValue}
                        error={error?.national_society_integrity_contact_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormIntegrityContactTitleLabel}
                        name="national_society_integrity_contact_title"
                        value={value.national_society_integrity_contact_title}
                        onChange={setFieldValue}
                        error={error?.national_society_integrity_contact_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormIntegrityContactEmailLabel}
                        name="national_society_integrity_contact_email"
                        value={value.national_society_integrity_contact_email}
                        onChange={setFieldValue}
                        error={error?.national_society_integrity_contact_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormIntegrityContactPhoneNumberLabel}
                        name="national_society_integrity_contact_phone_number"
                        value={value.national_society_integrity_contact_phone_number}
                        onChange={setFieldValue}
                        error={error?.national_society_integrity_contact_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalSocietyHotlineNumberTitle}
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormNationalSocietyHotlineNumberLabel}
                        name="national_society_hotline_phone_number"
                        value={value.national_society_hotline_phone_number}
                        onChange={setFieldValue}
                        error={error?.national_society_hotline_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
        </div>
    );
}

export default Submission;
