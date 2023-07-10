import {
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import DateInput from '#components/DateInput';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';

import { TYPE_LOAN } from '../common';
import { PartialDref } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialDref;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
}

function Submission(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        setFieldValue,
        value,
    } = props;

    const error = getErrorObject(formError);

    return (
        <div className={styles.submission}>
            <Container
                heading={strings.drefFormOperationalTimeframes}
                className={styles.operationalTimeframes}
            >
                <InputSection fullWidthColumn>
                    <DateInput
                        label={strings.drefFormNsRequestDate}
                        name="ns_request_date"
                        value={value.ns_request_date}
                        onChange={setFieldValue}
                        error={error?.ns_request_date}
                    />
                    <DateInput
                        label={strings.drefFormDateSubmissionToGeneva}
                        name="submission_to_geneva"
                        value={value.submission_to_geneva}
                        onChange={setFieldValue}
                        error={error?.submission_to_geneva}
                        hint={strings.drefFormAddedByGeneva}
                    />
                    <DateInput
                        label={strings.drefFormDateOfApproval}
                        name="date_of_approval"
                        value={value.date_of_approval}
                        onChange={setFieldValue}
                        error={error?.date_of_approval}
                        hint={strings.drefFormAddedByGeneva}
                    />
                </InputSection>
                <InputSection fullWidthColumn>
                    <NumberInput
                        label={strings.drefFormOperationTimeframeSubmission}
                        name="operation_timeframe"
                        placeholder={strings.drefFormOperationTimeframeSubmissionDescription}
                        value={value.operation_timeframe}
                        onChange={setFieldValue}
                        error={error?.operation_timeframe}
                    />
                    {value?.type_of_dref !== TYPE_LOAN && (
                        <DateInput
                            label={strings.drefFormSubmissionEndDate}
                            hint={strings.drefFormSubmissionEndDateDescription}
                            name="end_date"
                            value={value.end_date}
                            onChange={setFieldValue}
                            error={error?.end_date}
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
                    twoColumn
                >
                    <TextInput
                        name="appeal_code"
                        value={value.appeal_code}
                        onChange={setFieldValue}
                        error={error?.appeal_code}
                    />
                </InputSection>
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormGlideNum}
                        twoColumn
                    >
                        <TextInput
                            name="glide_code"
                            value={value.glide_code}
                            onChange={setFieldValue}
                            error={error?.glide_code}
                        />
                    </InputSection>
                )}
                <InputSection
                    title={strings.drefFormAppealManager}
                    description={strings.drefFormAppealManagerDescription}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="ifrc_appeal_manager_name"
                        value={value.ifrc_appeal_manager_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_name}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="ifrc_appeal_manager_title"
                        value={value.ifrc_appeal_manager_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_title}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="ifrc_appeal_manager_email"
                        value={value.ifrc_appeal_manager_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_email}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="ifrc_appeal_manager_phone_number"
                        value={value.ifrc_appeal_manager_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_appeal_manager_phone_number}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormProjectManager}
                    description={strings.drefFormProjectManagerDescription}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.drefFormSubmissionNameLabel}
                        name="ifrc_project_manager_name"
                        value={value.ifrc_project_manager_name}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_name}
                    />
                    <TextInput
                        label={strings.drefFormSubmissionTitleLabel}
                        name="ifrc_project_manager_title"
                        value={value.ifrc_project_manager_title}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_title}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionEmailLabel}
                        name="ifrc_project_manager_email"
                        value={value.ifrc_project_manager_email}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_email}
                    />
                    <TextInput
                        label={strings.drefFromSubmissionPhoneNumberLabel}
                        name="ifrc_project_manager_phone_number"
                        value={value.ifrc_project_manager_phone_number}
                        onChange={setFieldValue}
                        error={error?.ifrc_project_manager_phone_number}
                    />
                </InputSection>
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormNationalSocietyContact}
                        multiRow
                        twoColumn
                    >
                        <TextInput
                            label={strings.drefFormSubmissionNameLabel}
                            name="national_society_contact_name"
                            value={value.national_society_contact_name}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_name}
                        />
                        <TextInput
                            label={strings.drefFormSubmissionTitleLabel}
                            name="national_society_contact_title"
                            value={value.national_society_contact_title}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_title}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionEmailLabel}
                            name="national_society_contact_email"
                            value={value.national_society_contact_email}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_email}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionPhoneNumberLabel}
                            name="national_society_contact_phone_number"
                            value={value.national_society_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.national_society_contact_phone_number}
                        />
                    </InputSection>
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormIfrcEmergency}
                        multiRow
                        twoColumn
                    >
                        <TextInput
                            label={strings.drefFormSubmissionNameLabel}
                            name="ifrc_emergency_name"
                            value={value.ifrc_emergency_name}
                            onChange={setFieldValue}
                            error={error?.ifrc_emergency_name}
                        />
                        <TextInput
                            label={strings.drefFormSubmissionTitleLabel}
                            name="ifrc_emergency_title"
                            value={value.ifrc_emergency_title}
                            onChange={setFieldValue}
                            error={error?.ifrc_emergency_title}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionEmailLabel}
                            name="ifrc_emergency_email"
                            value={value.ifrc_emergency_email}
                            onChange={setFieldValue}
                            error={error?.ifrc_emergency_email}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionPhoneNumberLabel}
                            name="ifrc_emergency_phone_number"
                            value={value.ifrc_emergency_phone_number}
                            onChange={setFieldValue}
                            error={error?.ifrc_emergency_phone_number}
                        />
                    </InputSection>
                )}
                {value?.type_of_dref !== TYPE_LOAN && (
                    <InputSection
                        title={strings.drefFormMediaContact}
                        multiRow
                        twoColumn
                    >
                        <TextInput
                            label={strings.drefFormSubmissionNameLabel}
                            name="media_contact_name"
                            value={value.media_contact_name}
                            onChange={setFieldValue}
                            error={error?.media_contact_name}
                        />
                        <TextInput
                            label={strings.drefFormSubmissionTitleLabel}
                            name="media_contact_title"
                            value={value.media_contact_title}
                            onChange={setFieldValue}
                            error={error?.media_contact_title}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionEmailLabel}
                            name="media_contact_email"
                            value={value.media_contact_email}
                            onChange={setFieldValue}
                            error={error?.media_contact_email}
                        />
                        <TextInput
                            label={strings.drefFromSubmissionPhoneNumberLabel}
                            name="media_contact_phone_number"
                            value={value.media_contact_phone_number}
                            onChange={setFieldValue}
                            error={error?.media_contact_phone_number}
                        />
                    </InputSection>
                )}
            </Container>
        </div>
    );
}

export default Submission;
