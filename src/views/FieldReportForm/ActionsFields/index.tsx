import React from 'react';
import {
    Error,
    EntriesAsList,
    getErrorObject,
    getErrorString as listErrorToString,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    isDefined,
} from '@togglecorp/fujs';

import { type paths } from '#generated/types';
import Container from '#components/Container';
import MultiSelectInput from '#components/MultiSelectInput';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import ActionInput, { type ActionValue } from '../EarlyActionsFields/ActionInput';
import {
    type OrganizationType,
    type PartialFormValue,
    type ReportType,
    type CategoryType,
} from '../common';

import styles from './styles.module.css';
import i18n from './i18n.json';

type ExternalPartnerOptions = paths['/api/v2/external_partner/']['get']['responses']['200']['content']['application/json']['results'];
type SupportedActivityOptions = paths['/api/v2/supported_activity/']['get']['responses']['200']['content']['application/json']['results'];

interface Props {
    reportType: ReportType;
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    disabled?: boolean;
    externalPartnerOptions: ExternalPartnerOptions;
    supportedActivityOptions: SupportedActivityOptions;
    actionOptions: Record<
        OrganizationType,
        { id: number; name?: string | null, category?: CategoryType }[]
    > | undefined;
}

function ActionsFields(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        onValueChange,
        value,
        actionOptions,
        reportType,
        externalPartnerOptions,
        supportedActivityOptions,
        disabled,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const {
        api_field_report_bulletin: bulletinOptions,
    } = useGlobalEnums();

    interface OrganizationOption {
        key: OrganizationType;
        title: string;
        description: string;
    }

    const organizations: OrganizationOption[] = [
        {
            key: 'NTLS',
            title: strings.fieldsStep3CheckboxSectionsNSActionsEVTEPILabel,
            description: strings.fieldsStep3CheckboxSectionsNSActionsEVTEPIDescription,
        },
        {
            key: 'FDRN',
            title: strings.fieldsStep3CheckboxSectionsFederationActionsEVTEPILabel,
            description: strings.fieldsStep3CheckboxSectionsFederationActionsEVTEPIDescription,
        },
        {
            key: 'PNS',
            title: strings.fieldsStep3CheckboxSectionsPNSActionsEVTLabel,
            description: strings.fieldsStep3CheckboxSectionsPNSActionsEVTEPIDescription,
        },
    ];

    // FIXME: use memo
    const mapping = listToMap(
        value.actions_taken,
        (item) => item.organization,
        (_, __, index) => index,
    );

    const actionsError = getErrorObject(error?.actions_taken);

    const {
        setValue: setActionValue,
    } = useFormArray<'actions_taken', ActionValue>(
        'actions_taken',
        onValueChange,
    );

    if (reportType === 'COVID') {
        return (
            <Container
                className={styles.actionsFields}
                heading={strings.fieldReportFormActionTakenTitle}
            >
                <div className={styles.numericSection}>
                    <InputSection
                        title={strings.fieldsStep3Section1FieldsAssistedGovEVTEPILabel}
                    >
                        <NumberInput
                            name="gov_num_assisted"
                            value={value.gov_num_assisted}
                            onChange={onValueChange}
                            error={error?.gov_num_assisted}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep3Section1FieldsAssistedRCRCEVTEPILabel}
                        description={strings.fieldsStep3TooltipDescriptionRCRC}
                    >
                        <NumberInput
                            name="num_assisted"
                            value={value.num_assisted}
                            onChange={onValueChange}
                            error={error?.num_assisted}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep3Section1FieldsLocalStaffEVTEPILabel}
                        description={strings.fieldsStep3TooltipDescriptionNS}
                    >
                        <NumberInput
                            name="num_localstaff"
                            value={value.num_localstaff}
                            onChange={onValueChange}
                            error={error?.num_localstaff}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep3Section1FieldsVolunteersEVTEPILabel}
                        description={strings.fieldsStep3TooltipDescriptionVolunteers}
                    >
                        <NumberInput
                            name="num_volunteers"
                            value={value.num_volunteers}
                            onChange={onValueChange}
                            error={error?.num_volunteers}
                            disabled={disabled}
                        />
                    </InputSection>
                </div>
                <div className={styles.otherSection}>
                    {organizations.map((organization) => {
                        const index = mapping?.[organization.key];
                        return (
                            <InputSection
                                key={organization.key}
                                title={organization.title}
                                description={organization.description}
                                oneColumn
                                multiRow
                            >
                                <ActionInput
                                    name={index}
                                    organizationType={organization.key}
                                    // eslint-disable-next-line max-len
                                    value={isDefined(index) ? value.actions_taken?.[index] : undefined}
                                    // eslint-disable-next-line max-len
                                    error={isDefined(index) ? actionsError?.[organization.key] : undefined}
                                    onChange={setActionValue}
                                    actionOptions={actionOptions?.[organization.key]}
                                    disabled={disabled}
                                    reportType={reportType}
                                    healthNotes={(
                                        <TextArea
                                            label={strings.fieldsStep2NotesLabel}
                                            name="notes_health"
                                            onChange={onValueChange}
                                            value={value?.notes_health}
                                            error={error?.notes_health}
                                            placeholder={strings.fieldsStep3ActionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                    nsNotes={(
                                        <TextArea
                                            label={strings.fieldsStep2NotesLabel}
                                            name="notes_ns"
                                            onChange={onValueChange}
                                            value={value?.notes_ns}
                                            error={error?.notes_ns}
                                            placeholder={strings.fieldsStep3ActionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                    socioecoNotes={(
                                        <TextArea
                                            label={strings.fieldsStep2NotesLabel}
                                            name="notes_socioeco"
                                            onChange={onValueChange}
                                            value={value?.notes_socioeco}
                                            error={error?.notes_socioeco}
                                            placeholder={strings.fieldsStep3ActionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                />
                            </InputSection>
                        );
                    })}
                    <InputSection
                        title={strings.fieldsStep3ActionsOthersEVTEPILabel}
                        description={strings.fieldsStep3ActionsOthersEPICOVDescription}
                    >
                        <TextArea
                            name="actions_others"
                            value={value.actions_others}
                            onChange={onValueChange}
                            error={error?.actions_others}
                            placeholder={strings.fieldReportFormOthersActionsPlaceholder}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep3CombinedLabelExternalSupported}
                    >
                        <MultiSelectInput
                            name="external_partners"
                            value={value.external_partners}
                            error={listErrorToString(error?.external_partners)}
                            // FIXME: do not use inline functions
                            keySelector={(item) => item.id}
                            labelSelector={(item) => item.name ?? '?'}
                            options={externalPartnerOptions}
                            onChange={onValueChange}
                            disabled={disabled}
                        />
                        <MultiSelectInput
                            name="supported_activities"
                            value={value.supported_activities}
                            error={listErrorToString(error?.supported_activities)}
                            options={supportedActivityOptions}
                            // FIXME: do not use inline functions
                            keySelector={(item) => item.id}
                            labelSelector={(item) => item.name ?? '?'}
                            onChange={onValueChange}
                            disabled={disabled}
                        />
                    </InputSection>
                </div>
            </Container>
        );
    }

    return (
        <Container
            className={styles.actionsFields}
            heading={strings.fieldReportFormActionTakenTitle}
        >
            <div className={styles.numericSection}>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsAssistedGovEVTEPILabel}
                >
                    <NumberInput
                        name="gov_num_assisted"
                        value={value.gov_num_assisted}
                        onChange={onValueChange}
                        error={error?.gov_num_assisted}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsAssistedRCRCEVTEPILabel}
                >
                    <NumberInput
                        name="num_assisted"
                        value={value.num_assisted}
                        onChange={onValueChange}
                        error={error?.num_assisted}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsLocalStaffEVTEPILabel}
                >
                    <NumberInput
                        name="num_localstaff"
                        value={value.num_localstaff}
                        onChange={onValueChange}
                        error={error?.num_localstaff}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsVolunteersEVTEPILabel}
                >
                    <NumberInput
                        name="num_volunteers"
                        value={value.num_volunteers}
                        onChange={onValueChange}
                        error={error?.num_volunteers}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsExpatsEVTEPILabel}
                    description={strings.fieldsStep3Section1FieldsExpatsEVTEPIDescription}
                >
                    <NumberInput
                        name="num_expats_delegates"
                        value={value.num_expats_delegates}
                        onChange={onValueChange}
                        error={error?.num_expats_delegates}
                        disabled={disabled}
                    />
                </InputSection>
            </div>
            <div className={styles.otherSection}>
                {organizations.map((organization) => {
                    const index = mapping?.[organization.key];
                    return (
                        <InputSection
                            key={organization.key}
                            title={organization.title}
                            description={organization.description}
                            oneColumn
                            multiRow
                        >
                            <ActionInput
                                name={index}
                                organizationType={organization.key}
                                value={isDefined(index) ? value.actions_taken?.[index] : undefined}
                                // eslint-disable-next-line max-len
                                error={isDefined(index) ? actionsError?.[organization.key] : undefined}
                                onChange={setActionValue}
                                actionOptions={actionOptions?.[organization.key]}
                                disabled={disabled}
                                reportType={reportType}
                            />
                        </InputSection>
                    );
                })}
                <InputSection
                    title={strings.fieldReportFormInformationBulletinLabel}
                    description={strings.fieldReportFormInformationBulletinDescription}
                >
                    <RadioInput
                        name="bulletin"
                        options={bulletinOptions}
                        // FIXME: do not use inline functions
                        keySelector={(item) => item.key}
                        labelSelector={(item) => item.value}
                        value={value.bulletin}
                        onChange={onValueChange}
                        error={error?.bulletin}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3ActionsOthersEVTEPILabel}
                    description={strings.fieldsStep3ActionsOthersEVTEPIDescription}
                >
                    <TextArea
                        name="actions_others"
                        value={value.actions_others}
                        onChange={onValueChange}
                        error={error?.actions_others}
                        placeholder={strings.fieldReportFormOthersActionsPlaceholder}
                        disabled={disabled}
                    />
                </InputSection>
            </div>
        </Container>
    );
}

export default ActionsFields;
