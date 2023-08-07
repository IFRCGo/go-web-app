import React from 'react';
import { listToGroupList } from '@togglecorp/fujs';
import {
    PartialForm,
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import Checklist from '#components/Checklist';
import LanguageContext from '#root/languageContext';
import { listErrorToString } from '#utils/form';

import {
    FormType,
    Action,
    NumericValueOption,
} from '../common';

import styles from './styles.module.scss';

type CategoryType = 'Health' | 'NS Institutional Strengthening' | 'Socioeconomic Interventions';
const categoryNameToFieldNameMap: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [key in CategoryType]: 'notes_health' | 'notes_ns' | 'notes_socioeco';
} = {
    'Health': 'notes_health',
    'NS Institutional Strengthening': 'notes_ns',
    'Socioeconomic Interventions': 'notes_socioeco',
};

type Value = PartialForm<FormType>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    actionOptions: Action[];
    externalPartnerOptions: NumericValueOption[];
    supportedActivityOptions: NumericValueOption[];
    fetchingExternalPartners?: boolean;
    fetchingSupportedActivities?: boolean;
}

function CovidActionFields(props: Props) {
    const { strings } = React.useContext(LanguageContext);

    const {
        value,
        error: formError,
        onValueChange,
        actionOptions,
        externalPartnerOptions,
        supportedActivityOptions,
        fetchingExternalPartners,
        fetchingSupportedActivities,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError]
    );

    const categoryGroupedOptions = React.useMemo(() => {
        return listToGroupList(actionOptions, d => d.category, d => d) as {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [key in CategoryType]: Action[];
        };
    }, [actionOptions]);

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
                    />
                </InputSection>
            </div>
            <div className={styles.otherSection}>
                <InputSection
                    title={strings.fieldsStep3CheckboxSectionsNSActionsEVTEPILabel}
                    description={strings.fieldsStep3CheckboxSectionsNSActionsEVTEPIDescription}
                    oneColumn
                    multiRow
                >
                    {(Object.keys(categoryGroupedOptions) as CategoryType[]).map((category) => (
                        <div
                            className={styles.actionTaken}
                            key={category}
                        >
                            <div className={styles.category}>
                                { category }
                            </div>
                            <Checklist
                                name={"actions_ntls" as const}
                                onChange={onValueChange}
                                options={categoryGroupedOptions[category]}
                                labelSelector={d => d.label}
                                keySelector={d => d.value}
                                tooltipSelector={d => d.description}
                                value={value.actions_ntls}
                                error={listErrorToString(error?.actions_ntls)}
                            />
                            <TextArea
                                label={strings.fieldsStep2NotesLabel}
                                name={categoryNameToFieldNameMap[category]}
                                onChange={onValueChange}
                                value={value[categoryNameToFieldNameMap[category]]}
                                error={error?.[categoryNameToFieldNameMap[category]]}
                                placeholder={strings.fieldsStep3ActionsNotesPlaceholder}
                            />
                        </div>
                    ))}
                    <TextArea
                        label={strings.cmpActionDescriptionLabel}
                        name="actions_ntls_desc"
                        onChange={onValueChange}
                        value={value.actions_ntls_desc}
                        error={error?.actions_ntls_desc}
                        placeholder={strings.fieldsStep3CheckboxSectionsNSActionsEPIEWPlaceholder}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3CheckboxSectionsFederationActionsEVTEPILabel}
                    description={strings.fieldsStep3CheckboxSectionsFederationActionsEPICOVDescription}
                >
                    <TextArea
                        label={strings.cmpActionDescriptionLabel}
                        name="actions_fdrn_desc"
                        onChange={onValueChange}
                        value={value.actions_fdrn_desc}
                        error={error?.actions_fdrn_desc}
                        placeholder={strings.fieldsStep3CheckboxSectionsFederationActionsEVTEPIEWPlaceholder}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep3CheckboxSectionsPNSActionsEVTLabel}
                    description={strings.fieldsStep3CheckboxSectionsPNSActionsEPICOVDescription}
                >
                    <TextArea
                        label={strings.cmpActionDescriptionLabel}
                        name="actions_pns_desc"
                        onChange={onValueChange}
                        value={value.actions_pns_desc}
                        error={error?.actions_pns_desc}
                        placeholder={strings.fieldsStep3CheckboxSectionsPNSActionsEVTEPIEWPlaceholder}
                    />
                </InputSection>
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
                    <SelectInput<"external_partners", number>
                        name="external_partners"
                        value={value.external_partners}
                        error={error?.external_partners}
                        pending={fetchingExternalPartners}
                        options={externalPartnerOptions}
                        onChange={onValueChange}
                        isMulti
                        />
                    <SelectInput<"supported_activities", number>
                        name="supported_activities"
                        value={value.supported_activities}
                        error={error?.supported_activities}
                        options={supportedActivityOptions}
                        onChange={onValueChange}
                        pending={fetchingSupportedActivities}
                        isMulti
                        />
                    </InputSection>
                    </div>
                </Container>
    );
}

export default CovidActionFields;
