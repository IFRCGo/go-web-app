import React, { useMemo } from 'react';
import {
    Container,
    InputSection,
    MultiSelectInput,
    NumberInput,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString as listErrorToString,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type CategoryType,
    type OrganizationType,
    type ReportType,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialFormValue } from '../common';
import ActionInput, { type ActionValue } from '../EarlyActionsFields/ActionInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ExternalPartnerOptions = GoApiResponse<'/api/v2/external_partner/'>['results'];
type SupportedActivityOptions = GoApiResponse<'/api/v2/supported_activity/'>['results'];

interface Props {
    reportType: ReportType;
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    disabled?: boolean;
    externalPartnerOptions: ExternalPartnerOptions | undefined;
    supportedActivityOptions: SupportedActivityOptions | undefined;
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

    const organizations: OrganizationOption[] = useMemo(() => [
        {
            key: 'NTLS',
            title: strings.checkboxSectionsNSActionsEVTEPILabel,
            description: strings.checkboxSectionsNSActionsEVTEPIDescription,
        },
        {
            key: 'FDRN',
            title: strings.checkboxSectionsFederationActionsEVTEPILabel,
            description: strings.checkboxSectionsFederationActionsEVTEPIDescription,
        },
        {
            key: 'PNS',
            title: strings.checkboxSectionsPNSActionsEVTLabel,
            description: strings.checkboxSectionsPNSActionsEVTEPIDescription,
        },
    ], [
        strings.checkboxSectionsNSActionsEVTEPILabel,
        strings.checkboxSectionsNSActionsEVTEPIDescription,
        strings.checkboxSectionsFederationActionsEVTEPILabel,
        strings.checkboxSectionsFederationActionsEVTEPIDescription,
        strings.checkboxSectionsPNSActionsEVTLabel,
        strings.checkboxSectionsPNSActionsEVTEPIDescription,
    ]);

    const mapping = useMemo(() => listToMap(
        value.actions_taken,
        (item) => item.organization,
        (_, __, index) => index,
    ), [value.actions_taken]);

    const actionsError = getErrorObject(error?.actions_taken);

    // FIXME: We might need to use useFormArrayWithEmptyCheck
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
                heading={strings.actionTakenTitle}
                childrenContainerClassName={styles.content}
            >
                <div className={styles.numericSection}>
                    <NumberInput
                        label={strings.section1FieldsAssistedGovEVTEPILabel}
                        name="gov_num_assisted"
                        value={value.gov_num_assisted}
                        onChange={onValueChange}
                        error={error?.gov_num_assisted}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.section1FieldsAssistedRCRCEVTEPILabel}
                        hint={strings.tooltipDescriptionRCRC}
                        name="num_assisted"
                        value={value.num_assisted}
                        onChange={onValueChange}
                        error={error?.num_assisted}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.section1FieldsLocalStaffEVTEPILabel}
                        hint={strings.tooltipDescriptionNS}
                        name="num_localstaff"
                        value={value.num_localstaff}
                        onChange={onValueChange}
                        error={error?.num_localstaff}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.section1FieldsVolunteersEVTEPILabel}
                        hint={strings.tooltipDescriptionVolunteers}
                        name="num_volunteers"
                        value={value.num_volunteers}
                        onChange={onValueChange}
                        error={error?.num_volunteers}
                        disabled={disabled}
                    />
                </div>
                <div className={styles.otherSection}>
                    <NonFieldError error={getErrorObject(error?.actions_taken)} />
                    {organizations.map((organization) => {
                        const index = mapping?.[organization.key];
                        return (
                            <InputSection
                                key={organization.key}
                                title={organization.title}
                                description={organization.description}
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
                                            label={strings.actionFieldsNotesLabel}
                                            name="notes_health"
                                            onChange={onValueChange}
                                            value={value?.notes_health}
                                            error={error?.notes_health}
                                            placeholder={strings.actionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                    nsNotes={(
                                        <TextArea
                                            label={strings.actionFieldsNotesLabel}
                                            name="notes_ns"
                                            onChange={onValueChange}
                                            value={value?.notes_ns}
                                            error={error?.notes_ns}
                                            placeholder={strings.actionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                    socioecoNotes={(
                                        <TextArea
                                            label={strings.actionFieldsNotesLabel}
                                            name="notes_socioeco"
                                            onChange={onValueChange}
                                            value={value?.notes_socioeco}
                                            error={error?.notes_socioeco}
                                            placeholder={strings.actionsNotesPlaceholder}
                                            disabled={disabled}
                                        />
                                    )}
                                />
                            </InputSection>
                        );
                    })}
                    <InputSection
                        title={strings.actionsOthersEVTEPILabel}
                        description={strings.actionsOthersEPICOVDescription}
                    >
                        <TextArea
                            name="actions_others"
                            value={value.actions_others}
                            onChange={onValueChange}
                            error={error?.actions_others}
                            placeholder={strings.othersActionsPlaceholder}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.combinedLabelExternalSupported}
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
            heading={strings.actionTakenTitle}
            childrenContainerClassName={styles.content}
        >
            <div className={styles.numericSection}>
                <NumberInput
                    label={strings.section1FieldsAssistedGovEVTEPILabel}
                    name="gov_num_assisted"
                    value={value.gov_num_assisted}
                    onChange={onValueChange}
                    error={error?.gov_num_assisted}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.section1FieldsAssistedRCRCEVTEPILabel}
                    name="num_assisted"
                    value={value.num_assisted}
                    onChange={onValueChange}
                    error={error?.num_assisted}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.section1FieldsLocalStaffEVTEPILabel}
                    name="num_localstaff"
                    value={value.num_localstaff}
                    onChange={onValueChange}
                    error={error?.num_localstaff}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.section1FieldsVolunteersEVTEPILabel}
                    name="num_volunteers"
                    value={value.num_volunteers}
                    onChange={onValueChange}
                    error={error?.num_volunteers}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.section1FieldsExpatsEVTEPILabel}
                    hint={strings.section1FieldsExpatsEVTEPIDescription}
                    name="num_expats_delegates"
                    value={value.num_expats_delegates}
                    onChange={onValueChange}
                    error={error?.num_expats_delegates}
                    disabled={disabled}
                />
            </div>
            <div className={styles.otherSection}>
                <NonFieldError error={getErrorObject(error?.actions_taken)} />
                {organizations.map((organization) => {
                    const index = mapping?.[organization.key];
                    return (
                        <InputSection
                            key={organization.key}
                            title={organization.title}
                            description={organization.description}
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
                    title={strings.informationBulletinLabel}
                    description={strings.informationBulletinDescription}
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
                    title={strings.actionsOthersEVTEPILabel}
                    description={strings.actionsOthersEVTEPIDescription}
                >
                    <TextArea
                        name="actions_others"
                        value={value.actions_others}
                        onChange={onValueChange}
                        error={error?.actions_others}
                        placeholder={strings.othersActionsPlaceholder}
                        disabled={disabled}
                    />
                </InputSection>
            </div>
        </Container>
    );
}

export default ActionsFields;
