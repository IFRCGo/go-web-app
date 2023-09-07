import { useCallback } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import {
    type Error,
    type EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import DateInput from '#components/DateInput';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import { formatDate } from '#utils/common';

import { type PartialFinalReport } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

function calculateEndDate(
    dateOfApproval: string | undefined,
    operationTimeframe: number | undefined,
) {
    if (isNotDefined(dateOfApproval) || isNotDefined(operationTimeframe)) {
        return undefined;
    }
    const approvalDate = new Date(dateOfApproval);
    if (Number.isNaN(approvalDate)) {
        return undefined;
    }
    // FIXME: use a separate utility
    approvalDate.setMonth(
        approvalDate.getMonth() + operationTimeframe + 1,
    );
    approvalDate.setDate(0);
    approvalDate.setHours(0, 0, 0, 0);

    // NOTE: need to change the data type
    return formatDate(approvalDate, 'yyyy-MM-dd');
}

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
            const endDate = calculateEndDate(
                value.operation_start_date,
                val,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'operation_end_date');
            }
        },
        [setFieldValue, value.operation_start_date],
    );

    const handleOperationStartDateChange = useCallback(
        (val: string | undefined, name: 'operation_start_date') => {
            setFieldValue(val, name);
            const endDate = calculateEndDate(
                val,
                value.total_operation_timeframe,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'operation_end_date');
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
                <InputSection>
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
                <InputSection>
                    <DateInput
                        label={strings.finalReportEndOfOperation}
                        name="operation_end_date"
                        value={value.operation_end_date}
                        onChange={setFieldValue}
                        error={error?.operation_end_date}
                        disabled={disabled}
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
            </Container>
        </div>
    );
}

export default Submission;
