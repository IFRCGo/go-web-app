import React from 'react';
import {
    Error,
    EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { isDefined, listToMap } from '@togglecorp/fujs';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import {
    type OrganizationType,
    type PartialFormValue,
    type ReportType,
    type CategoryType,
} from '../common';

import ActionInput, { type ActionValue } from './ActionInput';
import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialFormValue;
interface Props {
    reportType: ReportType;
    actionOptions: Record<
        OrganizationType,
        { id: number; name?: string | null, category?: CategoryType }[]
    > | undefined;
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: Value;
    disabled?: boolean;
}

function EarlyActionFields(props: Props) {
    const strings = useTranslation(i18n);
    const {
        error: formError,
        onValueChange,
        value,
        actionOptions,
        disabled,
        reportType,
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
            title: strings.fieldsStep3CheckboxSectionsNSActionsEWLabel,
            description: strings.fieldsStep3CheckboxSectionsNSActionsEWDescription,
        },
        {
            key: 'FDRN',
            title: strings.fieldsStep3CheckboxSectionsFederationActionsEWLabel,
            description: strings.fieldsStep3CheckboxSectionsFederationActionsEWDescription,
        },
        {
            key: 'PNS',
            title: strings.fieldsStep3CheckboxSectionsPNSActionsEWLabel,
            description: strings.fieldsStep3CheckboxSectionsPNSActionsEWDescription,
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

    return (
        <Container
            heading={strings.fieldReportFormActionTakenTitle}
            className={styles.earlyActionFields}
        >
            <div className={styles.numericSection}>
                <InputSection
                    title={strings.fieldsStep3Section1FieldsAssistedGovEWLabel}
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
                    title={strings.fieldsStep3Section1FieldsAssistedRCRCEWLabel}
                >
                    <NumberInput
                        name="num_assisted"
                        value={value.num_assisted}
                        onChange={onValueChange}
                        error={error?.num_assisted}
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

export default EarlyActionFields;
