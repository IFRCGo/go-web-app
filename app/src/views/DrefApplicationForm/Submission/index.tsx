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
    addNumDaysToDate,
    addNumMonthsToDate,
    ceilToEndOfMonth,
    encodeDate,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import {
    TYPE_IMMINENT,
    TYPE_LOAN,
} from '../common';
import { type PartialDref } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            const endDate = addNumMonthsToDate(
                value.date_of_approval,
                val,
            );
            if (isDefined(endDate)) {
                setFieldValue(encodeDate(endDate), 'end_date');
            }
        },
        [setFieldValue, value.date_of_approval],
    );

    const handleImminentOperationTimeframeChange = useCallback(
        (val: number | undefined, name: 'operation_timeframe_imminent') => {
            setFieldValue(val, name);
            const endDate = ceilToEndOfMonth(
                addNumDaysToDate(
                    value.date_of_approval,
                    val,
                ),
            );
            if (isDefined(endDate)) {
                setFieldValue(encodeDate(endDate), 'end_date');
            }
        },
        [setFieldValue, value.date_of_approval],
    );

    const handleDateOfApproval = useCallback(
        (val: string | undefined, name: 'date_of_approval') => {
            setFieldValue(val, name);
            if (value.type_of_dref === TYPE_IMMINENT) {
                const endDate = ceilToEndOfMonth(
                    addNumDaysToDate(
                        val,
                        value.operation_timeframe_imminent,
                    ),
                );

                if (isDefined(endDate)) {
                    setFieldValue(encodeDate(endDate), 'end_date');
                }
            } else {
                const endDate = addNumMonthsToDate(
                    val,
                    value.operation_timeframe,
                );
                if (isDefined(endDate)) {
                    setFieldValue(encodeDate(endDate), 'end_date');
                }
            }
        },
        [
            setFieldValue,
            value.operation_timeframe,
            value.operation_timeframe_imminent,
            value.type_of_dref,
        ],
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
                        hint={strings.drefFormAddedByRegionalOffice}
                        disabled={disabled}
                    />
                    <DateInput
                        label={strings.drefFormDateOfApproval}
                        name="date_of_approval"
                        value={value.date_of_approval}
                        onChange={handleDateOfApproval}
                        error={error?.date_of_approval}
                        hint={strings.drefFormAddedByRegionalOffice}
                        disabled={disabled}
                    />
                    {value?.type_of_dref !== TYPE_IMMINENT && (
                        <NumberInput
                            label={strings.drefFormOperationTimeframeSubmission}
                            name="operation_timeframe"
                            placeholder={strings.drefFormOperationTimeframeSubmissionDescription}
                            value={value.operation_timeframe}
                            onChange={handleOperationTimeframeChange}
                            error={error?.operation_timeframe}
                            disabled={disabled}
                        />
                    )}
                    {value?.type_of_dref === TYPE_IMMINENT && (
                        <NumberInput
                            label={strings.drefFormOperationTimeframeSubmissionForImminent}
                            name="operation_timeframe_imminent"
                            placeholder={strings.drefFormOperationTimeframeSubmissionDescription}
                            value={value.operation_timeframe_imminent}
                            onChange={handleImminentOperationTimeframeChange}
                            error={error?.operation_timeframe_imminent}
                            disabled={disabled}
                            readOnly
                        />
                    )}
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
                            hint={strings.drefFormAddedByRegionalOffice}
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
                {value?.type_of_dref !== TYPE_LOAN && value?.type_of_dref !== TYPE_IMMINENT && (
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
                        title={
                            value.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormIfrcOperation
                                : strings.drefFormIfrcEmergency
                        }
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
                    numPreferredColumns={2}
                >
                    <TextInput
                        label={strings.drefFormFocalPointName}
                        name="regional_focal_point_name"
                        value={value.regional_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_name}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormFocalPointTitle}
                        name="regional_focal_point_title"
                        value={value.regional_focal_point_title}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_title}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormFocalPointEmail}
                        name="regional_focal_point_email"
                        value={value.regional_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.regional_focal_point_email}
                        disabled={disabled}
                    />
                    <TextInput
                        label={strings.drefFormFocalPointPhoneNumber}
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
