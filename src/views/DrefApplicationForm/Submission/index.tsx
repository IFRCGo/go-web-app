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
import { type PartialDref } from '../schema';

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

type Value = PartialDref;

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

    const handleOperationTimeframeChange = useCallback(
        (val: number | undefined, name: 'operation_timeframe') => {
            setFieldValue(val, name);
            const endDate = calculateEndDate(
                value.date_of_approval,
                val,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'end_date');
            }
        },
        [setFieldValue, value.date_of_approval],
    );

    const handleDateOfApproval = useCallback(
        (val: string | undefined, name: 'date_of_approval') => {
            setFieldValue(val, name);
            const endDate = calculateEndDate(
                val,
                value.operation_timeframe,
            );
            if (isDefined(endDate)) {
                setFieldValue(endDate, 'end_date');
            }
        },
        [setFieldValue, value.operation_timeframe],
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
                    <DateInput
                        label={strings.drefFormNsRequestDate}
                        name="ns_request_date"
                        value={value.ns_request_date}
                        onChange={setFieldValue}
                        error={error?.ns_request_date}
                        disabled={disabled}
                    />
                    <DateInput
                        label={strings.drefFormDateSubmissionToGeneva}
                        name="submission_to_geneva"
                        value={value.submission_to_geneva}
                        onChange={setFieldValue}
                        error={error?.submission_to_geneva}
                        hint={strings.drefFormAddedByGeneva}
                        disabled={disabled}
                    />
                    <DateInput
                        label={strings.drefFormDateOfApproval}
                        name="date_of_approval"
                        value={value.date_of_approval}
                        onChange={handleDateOfApproval}
                        error={error?.date_of_approval}
                        hint={strings.drefFormAddedByGeneva}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.drefFormOperationTimeframeSubmission}
                        name="operation_timeframe"
                        placeholder={strings.drefFormOperationTimeframeSubmissionDescription}
                        value={value.operation_timeframe}
                        onChange={handleOperationTimeframeChange}
                        error={error?.operation_timeframe}
                        disabled={disabled}
                    />
                    {value?.type_of_dref !== TYPE_LOAN && (
                        <DateInput
                            label={strings.drefFormSubmissionEndDate}
                            hint={strings.drefFormSubmissionEndDateDescription}
                            name="end_date"
                            value={value.end_date}
                            onChange={setFieldValue}
                            error={error?.end_date}
                            disabled={disabled}
                            readOnly
                        />
                    )}
                    {value?.type_of_dref !== TYPE_LOAN && (
                        <DateInput
                            label={strings.drefFormPublishingDate}
                            name="publishing_date"
                            value={value.publishing_date}
                            onChange={setFieldValue}
                            error={error?.publishing_date}
                            hint={strings.drefFormAddedByGeneva}
                            disabled={disabled}
                        />
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
                {value?.type_of_dref === TYPE_LOAN && (
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
                        />
                        <TextInput
                            // FIXME: use translations
                            label="Title"
                            name="regional_focal_point_title"
                            value={value.regional_focal_point_title}
                            onChange={setFieldValue}
                            error={error?.regional_focal_point_title}
                        />
                        <TextInput
                            // FIXME: use translations
                            label="Email"
                            name="regional_focal_point_email"
                            value={value.regional_focal_point_email}
                            onChange={setFieldValue}
                            error={error?.regional_focal_point_email}
                        />
                        <TextInput
                            // FIXME: use translations
                            label="Phone Number"
                            name="regional_focal_point_phone_number"
                            value={value.regional_focal_point_phone_number}
                            onChange={setFieldValue}
                            error={error?.regional_focal_point_phone_number}
                        />
                    </InputSection>
                )}
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
