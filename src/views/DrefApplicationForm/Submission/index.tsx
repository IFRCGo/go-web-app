import {
    PartialForm,
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
import drefPageStrings from '#strings/dref';

import { DrefFields, TYPE_LOAN } from '../common';

import styles from './styles.module.css';

type Value = PartialForm<DrefFields>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    drefType?: number;
}

function Submission(props: Props) {
    const strings = useTranslation('dref', drefPageStrings);

    const {
        error: formError,
        onValueChange,
        value,
        drefType,
    } = props;

    const error = getErrorObject(formError);

    return (
        <>
            <Container
                heading={strings.drefFormOperationalTimeframes}
                className={styles.operationalTimeframes}
            >
                <InputSection
                    fullWidthColumn
                >
                    <DateInput
                        label={strings.drefFormNsRequestDate}
                        name="ns_request_date"
                        value={value.ns_request_date}
                        onChange={onValueChange}
                        error={error?.ns_request_date}
                    />
                    <DateInput
                        label={strings.drefFormDateSubmissionToGeneva}
                        name="submission_to_geneva"
                        value={value.submission_to_geneva}
                        onChange={onValueChange}
                        error={error?.submission_to_geneva}
                        hint={strings.drefFormAddedByGeneva}
                    />
                    <DateInput
                        label={strings.drefFormDateOfApproval}
                        name="date_of_approval"
                        value={value.date_of_approval}
                        onChange={onValueChange}
                        error={error?.date_of_approval}
                        hint={strings.drefFormAddedByGeneva}
                    />
                </InputSection>
                <InputSection
                    fullWidthColumn
                >
                    <NumberInput
                        label={strings.drefFormOperationTimeframeSubmission}
                        name="operation_timeframe"
                        placeholder={strings.drefFormOperationTimeframeSubmissionDescription}
                        value={value.operation_timeframe}
                        onChange={onValueChange}
                        error={error?.operation_timeframe}
                    />
                    {drefType !== TYPE_LOAN
                        && (
                            <DateInput
                                label={strings.drefFormSubmissionEndDate}
                                hint={strings.drefFormSubmissionEndDateDescription}
                                name="end_date"
                                value={value.end_date}
                                onChange={onValueChange}
                                error={error?.end_date}
                                readOnly
                            />
                        )}
                    {drefType !== TYPE_LOAN
                        && (
                            <DateInput
                                label={strings.drefFormPublishingDate}
                                name="publishing_date"
                                value={value.publishing_date}
                                onChange={onValueChange}
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
                >
                    <TextInput
                        name="appeal_code"
                        value={value.appeal_code}
                        onChange={onValueChange}
                        error={error?.appeal_code}
                    />
                </InputSection>
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={strings.drefFormGlideNum}
                        >
                            <TextInput
                                name="glide_code"
                                value={value.glide_code}
                                onChange={onValueChange}
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
                        label="Name"
                        name="ifrc_appeal_manager_name"
                        value={value.ifrc_appeal_manager_name}
                        onChange={onValueChange}
                        error={error?.ifrc_appeal_manager_name}
                    />
                    <TextInput
                        label="Title"
                        name="ifrc_appeal_manager_title"
                        value={value.ifrc_appeal_manager_title}
                        onChange={onValueChange}
                        error={error?.ifrc_appeal_manager_title}
                    />
                    <TextInput
                        label="Email"
                        name="ifrc_appeal_manager_email"
                        value={value.ifrc_appeal_manager_email}
                        onChange={onValueChange}
                        error={error?.ifrc_appeal_manager_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="ifrc_appeal_manager_phone_number"
                        value={value.ifrc_appeal_manager_phone_number}
                        onChange={onValueChange}
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
                        label="Name"
                        name="ifrc_project_manager_name"
                        value={value.ifrc_project_manager_name}
                        onChange={onValueChange}
                        error={error?.ifrc_project_manager_name}
                    />
                    <TextInput
                        label="Title"
                        name="ifrc_project_manager_title"
                        value={value.ifrc_project_manager_title}
                        onChange={onValueChange}
                        error={error?.ifrc_project_manager_title}
                    />
                    <TextInput
                        label="Email"
                        name="ifrc_project_manager_email"
                        value={value.ifrc_project_manager_email}
                        onChange={onValueChange}
                        error={error?.ifrc_project_manager_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="ifrc_project_manager_phone_number"
                        value={value.ifrc_project_manager_phone_number}
                        onChange={onValueChange}
                        error={error?.ifrc_project_manager_phone_number}
                    />
                </InputSection>
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={strings.drefFormNationalSocietyContact}
                            multiRow
                            twoColumn
                        >
                            <TextInput
                                label="Name"
                                name="national_society_contact_name"
                                value={value.national_society_contact_name}
                                onChange={onValueChange}
                                error={error?.national_society_contact_name}
                            />
                            <TextInput
                                label="Title"
                                name="national_society_contact_title"
                                value={value.national_society_contact_title}
                                onChange={onValueChange}
                                error={error?.national_society_contact_title}
                            />
                            <TextInput
                                label="Email"
                                name="national_society_contact_email"
                                value={value.national_society_contact_email}
                                onChange={onValueChange}
                                error={error?.national_society_contact_email}
                            />
                            <TextInput
                                label="Phone Number"
                                name="national_society_contact_phone_number"
                                value={value.national_society_contact_phone_number}
                                onChange={onValueChange}
                                error={error?.national_society_contact_phone_number}
                            />
                        </InputSection>
                    )}
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={strings.drefFormIfrcEmergency}
                            multiRow
                            twoColumn
                        >
                            <TextInput
                                label="Name"
                                name="ifrc_emergency_name"
                                value={value.ifrc_emergency_name}
                                onChange={onValueChange}
                                error={error?.ifrc_emergency_name}
                            />
                            <TextInput
                                label="Title"
                                name="ifrc_emergency_title"
                                value={value.ifrc_emergency_title}
                                onChange={onValueChange}
                                error={error?.ifrc_emergency_title}
                            />
                            <TextInput
                                label="Email"
                                name="ifrc_emergency_email"
                                value={value.ifrc_emergency_email}
                                onChange={onValueChange}
                                error={error?.ifrc_emergency_email}
                            />
                            <TextInput
                                label="Phone Number"
                                name="ifrc_emergency_phone_number"
                                value={value.ifrc_emergency_phone_number}
                                onChange={onValueChange}
                                error={error?.ifrc_emergency_phone_number}
                            />
                        </InputSection>
                    )}
                {drefType !== TYPE_LOAN
                    && (
                        <InputSection
                            title={strings.drefFormMediaContact}
                            multiRow
                            twoColumn
                        >
                            <TextInput
                                label="Name"
                                name="media_contact_name"
                                value={value.media_contact_name}
                                onChange={onValueChange}
                                error={error?.media_contact_name}
                            />
                            <TextInput
                                label="Title"
                                name="media_contact_title"
                                value={value.media_contact_title}
                                onChange={onValueChange}
                                error={error?.media_contact_title}
                            />
                            <TextInput
                                label="Email"
                                name="media_contact_email"
                                value={value.media_contact_email}
                                onChange={onValueChange}
                                error={error?.media_contact_email}
                            />
                            <TextInput
                                label="Phone Number"
                                name="media_contact_phone_number"
                                value={value.media_contact_phone_number}
                                onChange={onValueChange}
                                error={error?.media_contact_phone_number}
                            />
                        </InputSection>
                    )}
            </Container>
        </>
    );
}

export default Submission;
