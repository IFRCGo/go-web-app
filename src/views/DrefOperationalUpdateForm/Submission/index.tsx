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

import { TYPE_LOAN } from '../common';
import { type PartialOpsUpdate } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

function calculateEndDate(
    startDate: string | undefined,
    duration: number | undefined,
) {
    if (isNotDefined(startDate) || isNotDefined(duration)) {
        return undefined;
    }
    const approvalDate = new Date(startDate);
    if (Number.isNaN(approvalDate)) {
        return undefined;
    }
    // FIXME: use a separate utility
    approvalDate.setMonth(
        approvalDate.getMonth() + duration + 1,
    );
    approvalDate.setDate(0);
    approvalDate.setHours(0, 0, 0, 0);

    // NOTE: need to change the data type
    return formatDate(approvalDate, 'yyyy-MM-dd');
}

type Value = PartialOpsUpdate;

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
                value.new_operational_start_date,
                val,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'new_operational_end_date');
            }
        },
        [setFieldValue, value.new_operational_start_date],
    );

    const handleNewOperationalStartDate = useCallback(
        (val: string | undefined, name: 'new_operational_start_date') => {
            setFieldValue(val, name);
            const endDate = calculateEndDate(
                val,
                value.total_operation_timeframe,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'new_operational_end_date');
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
                    numPreferredColumns={3}
                >
                    {value.type_of_dref !== TYPE_LOAN && (
                        <DateInput
                            label={strings.drefOperationalUpdateTimeFrameDateOfEvent}
                            name="new_operational_start_date"
                            value={value.new_operational_start_date}
                            onChange={handleNewOperationalStartDate}
                            error={error?.new_operational_start_date}
                            disabled={disabled}
                            readOnly
                        />
                    )}
                    {value.type_of_dref === TYPE_LOAN && (
                        <DateInput
                            label={strings.drefOperationalUpdateTimeFrameNationalSocietyLoanRequest}
                            name="ns_request_date"
                            value={value.ns_request_date}
                            onChange={setFieldValue}
                            error={error?.ns_request_date}
                            disabled={disabled}
                        />
                    )}
                    <NumberInput
                        label={strings.drefOperationalUpdateTimeFrameTotalOperatingTimeFrame}
                        name="total_operation_timeframe"
                        value={value.total_operation_timeframe}
                        onChange={handleTotalOperationTimeframeChange}
                        error={error?.total_operation_timeframe}
                        disabled={disabled}
                    />
                    {value.type_of_dref !== TYPE_LOAN && (
                        <DateInput
                            label={strings.drefOperationalUpdateTimeFrameExtensionRequestedIfYes}
                            name="new_operational_end_date"
                            value={value.new_operational_end_date}
                            onChange={setFieldValue}
                            error={error?.new_operational_end_date}
                            disabled={disabled}
                        />
                    )}
                    {value.type_of_dref === TYPE_LOAN && (
                        <DateInput
                            label={strings.drefOperationalDateOfApprovalOfLoan}
                            name="date_of_approval"
                            value={value.date_of_approval}
                            onChange={setFieldValue}
                            error={error?.date_of_approval}
                            disabled={disabled}
                        />
                    )}
                    {value.type_of_dref !== TYPE_LOAN && (
                        <>
                            <DateInput
                                // eslint-disable-next-line max-len
                                label={strings.drefOperationalUpdateTimeFrameReportingTimeFrameStart}
                                name="reporting_start_date"
                                value={value.reporting_start_date}
                                onChange={setFieldValue}
                                error={error?.reporting_start_date}
                                disabled={disabled}
                            />
                            <DateInput
                                label={strings.drefOperationalUpdateTimeFrameReportingTimeFrameEnd}
                                name="reporting_end_date"
                                value={value.reporting_end_date}
                                onChange={setFieldValue}
                                error={error?.reporting_end_date}
                                disabled={disabled}
                            />
                        </>
                    )}
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
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
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
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
                <InputSection
                    title={strings.drefFormDrefRegionalPoint}
                >
                    <TextInput
                        // FIXME: use translations
                        label="Name"
                        name="regional_focal_point_name"
                        value={value.regional_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        // FIXME: use translations
                        label="Title"
                        name="regional_focal_point_title"
                        value={value.regional_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        // FIXME: use translations
                        label="Email"
                        name="regional_focal_point_email"
                        value={value.regional_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        // FIXME: use translations
                        label="Phone Number"
                        name="regional_focal_point_phone_number"
                        value={value.regional_focal_point_phone_number}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_phone_number}
                        disabled={disabled}
                    />
                </InputSection>
                {value?.type_of_dref !== TYPE_LOAN && (
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
                )}
            </Container>
        </div>
    );
}

export default Submission;
