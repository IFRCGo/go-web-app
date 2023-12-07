import {
    useMemo,
    useCallback,
    useState,
} from 'react';
import {
    randomString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type Error,
    type EntriesAsList,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { ErrorWarningFillIcon } from '@ifrc-go/icons';

import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import InputLabel from '#components/InputLabel';
import { sumSafe } from '#utils/common';
import BooleanInput from '#components/BooleanInput';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import useTranslation from '#hooks/useTranslation';
import { stringValueSelector } from '#utils/selectors';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import InterventionInput from './InterventionInput';
import RiskSecurityInput from './RiskSecurityInput';
import {
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialFinalReport } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PlannedInterventionOption = NonNullable<GlobalEnumsResponse['dref_planned_intervention_title']>[number];

type Value = PartialFinalReport;
type PlannedInterventionFormFields = NonNullable<PartialFinalReport['planned_interventions']>[number];
type RiskSecurityFormFields = NonNullable<PartialFinalReport['risk_security']>[number];

function plannedInterventionKeySelector(option: PlannedInterventionOption) {
    return option.key;
}

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function Operation(props: Props) {
    const strings = useTranslation(i18n);
    const {
        dref_planned_intervention_title: plannedInterventionOptions,
    } = useGlobalEnums();

    const {
        value,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const [
        selectedIntervention,
        setSelectedIntervention,
    ] = useState<PlannedInterventionOption['key'] | undefined>();

    const {
        setValue: onInterventionChange,
        removeValue: onInterventionRemove,
    } = useFormArray<'planned_interventions', PlannedInterventionFormFields>(
        'planned_interventions',
        setFieldValue,
    );

    const {
        setValue: onRiskSecurityChange,
        removeValue: onRiskSecurityRemove,
    } = useFormArray<'risk_security', RiskSecurityFormFields>(
        'risk_security',
        setFieldValue,
    );

    const handleInterventionAddButtonClick = useCallback((title: PlannedInterventionOption['key'] | undefined) => {
        const newInterventionItem : PlannedInterventionFormFields = {
            client_id: randomString(),
            title,
        };

        setFieldValue(
            (oldValue: PlannedInterventionFormFields[] | undefined) => (
                [...(oldValue ?? []), newInterventionItem]
            ),
            'planned_interventions' as const,
        );
        setSelectedIntervention(undefined);
    }, [setFieldValue, setSelectedIntervention]);

    const warnings = useMemo(() => {
        if (isNotDefined(value?.total_targeted_population)) {
            return [];
        }

        const w = [];

        if (sumSafe([
            value?.women,
            value?.men,
            value?.girls,
            value?.boys,
        ]) !== value?.total_targeted_population) {
            w.push(strings.drefFinalReportTotalTargeted);
        }

        return w;
    }, [
        strings.drefFinalReportTotalTargeted,
        value?.women,
        value?.men,
        value?.girls,
        value?.boys,
        value?.total_targeted_population,
    ]);

    const interventionMap = useMemo(() => (
        listToMap(
            value.planned_interventions,
            (plannedIntervention) => plannedIntervention.title ?? '<no-key>',
            () => true,
        )
    ), [value.planned_interventions]);

    const filteredInterventionOptions = useMemo(
        () => (
            plannedInterventionOptions?.filter(
                (pi) => !interventionMap?.[pi.key],
            )
        ),
        [interventionMap, plannedInterventionOptions],
    );

    const handleRiskSecurityAdd = useCallback(() => {
        const newRiskSecurityItem: RiskSecurityFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: RiskSecurityFormFields[] | undefined) => (
                [...(oldValue ?? []), newRiskSecurityItem]
            ),
            'risk_security' as const,
        );
    }, [setFieldValue]);

    const interventionTitleMap = useMemo(
        () => (
            listToMap(
                plannedInterventionOptions,
                (plannedIntervention) => plannedIntervention.key,
                (plannedIntervention) => plannedIntervention.value,
            )
        ),
        [plannedInterventionOptions],
    );

    return (
        <div className={styles.operation}>
            <Container
                heading={strings.drefFormObjectiveAndStrategy}
                className={styles.objectiveRationale}
            >
                <InputSection
                    title={strings.drefFormObjectiveOperation}
                >
                    <TextArea
                        name="operation_objective"
                        onChange={setFieldValue}
                        value={value.operation_objective}
                        error={error?.operation_objective}
                        placeholder={strings.drefFormObjectiveOperationPlaceholder}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormResponseRationale}
                    description={value?.type_of_dref === TYPE_ASSESSMENT
                        && strings.drefFormResponseRationaleDescription}
                >
                    <TextArea
                        name="response_strategy"
                        onChange={setFieldValue}
                        value={value.response_strategy}
                        error={error?.response_strategy}
                        placeholder={strings.drefFormResponseRationalePlaceholder}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormTargetingStrategy}
                className={styles.targetingStrategy}
            >
                <InputSection
                    title={strings.drefFormPeopleAssistedThroughOperation}
                    description={strings.drefFormPeopleAssistedThroughOperationDescription}
                >
                    <TextArea
                        label={strings.drefFormOperationDescription}
                        name="people_assisted"
                        onChange={setFieldValue}
                        value={value.people_assisted}
                        error={error?.people_assisted}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormSelectionCriteria}
                    description={strings.drefFormSelectionCriteriaDescription}
                >
                    <TextArea
                        label={strings.drefFormOperationDescription}
                        name="selection_criteria"
                        onChange={setFieldValue}
                        value={value.selection_criteria}
                        error={error?.selection_criteria}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.finalReportChangeToOperationStrategy}
                >
                    <BooleanInput
                        name="change_in_operational_strategy"
                        value={value.change_in_operational_strategy}
                        onChange={setFieldValue}
                        error={error?.change_in_operational_strategy}
                        disabled={disabled}
                    />
                </InputSection>
                {value.change_in_operational_strategy && (
                    <InputSection
                        title={strings.finalReportChangeToOperationStrategyExplain}
                    >
                        <TextArea
                            label={strings.drefFormDescription}
                            name="change_in_operational_strategy_text"
                            onChange={setFieldValue}
                            value={value.change_in_operational_strategy_text}
                            error={error?.change_in_operational_strategy_text}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
            <Container
                heading={strings.drefFormAssistedPopulation}
                // NOTE: This condition was not present
                headerDescription={(
                    value?.type_of_dref !== TYPE_ASSESSMENT
                    && warnings?.map((w) => (
                        <div
                            className={styles.warning}
                            key={w}
                        >
                            <ErrorWarningFillIcon className={styles.icon} />
                            {w}
                        </div>
                    ))
                )}
            >
                <InputSection
                    title={strings.drefFormTargetedPopulation}
                    numPreferredColumns={2}
                >
                    {/* NOTE: This condition was not present */}
                    {value?.type_of_dref !== TYPE_ASSESSMENT && (
                        <>
                            <NumberInput
                                label={strings.drefFormWomen}
                                name="women"
                                value={value.women}
                                onChange={setFieldValue}
                                error={error?.women}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormMen}
                                name="men"
                                value={value.men}
                                onChange={setFieldValue}
                                error={error?.men}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormGirls}
                                name="girls"
                                value={value.girls}
                                onChange={setFieldValue}
                                error={error?.girls}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormBoys}
                                name="boys"
                                value={value.boys}
                                onChange={setFieldValue}
                                error={error?.boys}
                                disabled={disabled}
                            />
                        </>
                    )}
                    <NumberInput
                        label={strings.drefFormTotal}
                        name="total_targeted_population"
                        value={value.total_targeted_population}
                        onChange={setFieldValue}
                        error={error?.total_targeted_population}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormEstimateResponse}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.drefFormEstimatePeopleDisability}
                        name="disability_people_per"
                        value={value.disability_people_per}
                        onChange={setFieldValue}
                        error={error?.disability_people_per}
                        disabled={disabled}
                    />
                    <div className={styles.urbanToRural}>
                        <InputLabel>
                            {strings.drefFormEstimatedPercentage}
                        </InputLabel>
                        <div className={styles.inputs}>
                            <NumberInput
                                placeholder={strings.drefFormEstimatedUrban}
                                name="people_per_urban"
                                value={value.people_per_urban}
                                onChange={setFieldValue}
                                error={error?.people_per_urban}
                                disabled={disabled}
                            />
                            <NumberInput
                                placeholder={strings.drefFormEstimatedLocal}
                                name="people_per_local"
                                value={value.people_per_local}
                                onChange={setFieldValue}
                                error={error?.people_per_local}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                    <NumberInput
                        label={strings.drefFormEstimatedDisplacedPeople}
                        name="displaced_people"
                        value={value.displaced_people}
                        onChange={setFieldValue}
                        error={error?.displaced_people}
                        disabled={disabled}
                    />
                    {value?.type_of_dref === TYPE_IMMINENT && (
                        <NumberInput
                            label={strings.drefFormPeopleTargetedWithEarlyActions}
                            name="people_targeted_with_early_actions"
                            value={value.people_targeted_with_early_actions}
                            onChange={setFieldValue}
                            error={error?.people_targeted_with_early_actions}
                            disabled={disabled}
                        />
                    )}
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormRiskSecurity}
            >
                <InputSection
                    title={strings.drefFormRiskSecurityPotentialRisk}
                    description={value?.type_of_dref === TYPE_ASSESSMENT
                        && strings.drefFormRiskSecurityPotentialRiskDescription}
                >
                    <NonFieldError error={getErrorObject(error?.risk_security)} />
                    {value.risk_security?.map((rs, i) => (
                        <RiskSecurityInput
                            key={rs.client_id}
                            index={i}
                            value={rs}
                            onChange={onRiskSecurityChange}
                            onRemove={onRiskSecurityRemove}
                            error={getErrorObject(error?.risk_security)}
                            disabled={disabled}
                        />
                    ))}
                    <div className={styles.actions}>
                        <Button
                            name={undefined}
                            onClick={handleRiskSecurityAdd}
                            variant="secondary"
                            disabled={disabled}
                        >
                            {strings.drefFormRiskSecurityAddButton}
                        </Button>
                    </div>
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskSecuritySafetyConcern}
                >
                    <TextArea
                        name="risk_security_concern"
                        value={value.risk_security_concern}
                        error={error?.risk_security_concern}
                        onChange={setFieldValue}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskSecurityHasChildRiskCompleted}
                >
                    <BooleanInput
                        name="has_child_safeguarding_risk_analysis_assessment"
                        value={value.has_child_safeguarding_risk_analysis_assessment}
                        onChange={setFieldValue}
                        error={error?.has_child_safeguarding_risk_analysis_assessment}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormPlannedIntervention}
                className={styles.plannedIntervention}
            >
                <InputSection>
                    <div className={styles.interventionSelectionContainer}>
                        <SelectInput
                            className={styles.input}
                            name={undefined}
                            label={strings.drefFormInterventionsLabel}
                            options={filteredInterventionOptions}
                            keySelector={plannedInterventionKeySelector}
                            labelSelector={stringValueSelector}
                            onChange={setSelectedIntervention}
                            value={selectedIntervention}
                            disabled={disabled}
                        />
                        <Button
                            className={styles.action}
                            variant="secondary"
                            name={selectedIntervention}
                            onClick={handleInterventionAddButtonClick}
                            disabled={isNotDefined(selectedIntervention) || disabled}
                        >
                            {strings.drefFormResponseAddButton}
                        </Button>
                    </div>
                </InputSection>
                <NonFieldError error={getErrorObject(error?.planned_interventions)} />
                {value?.planned_interventions?.map((intervention, i) => (
                    <InterventionInput
                        key={intervention.client_id}
                        index={i}
                        value={intervention}
                        onChange={onInterventionChange}
                        onRemove={onInterventionRemove}
                        error={getErrorObject(error?.planned_interventions)}
                        titleMap={interventionTitleMap}
                        disabled={disabled}
                    />
                ))}
            </Container>
            <Container
                heading={strings.finalReportFinancialReport}
            >
                <InputSection>
                    <GoSingleFileInput
                        accept=".pdf"
                        name="financial_report"
                        value={value.financial_report}
                        onChange={setFieldValue}
                        url="/api/v2/dref-files/"
                        error={error?.financial_report}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        disabled={disabled}
                    >
                        {strings.finalReportFinancialReportAttachment}
                    </GoSingleFileInput>
                </InputSection>
                <InputSection title={strings.finalReportFinancialReportVariances}>
                    <TextArea
                        name="financial_report_description"
                        value={value.financial_report_description}
                        onChange={setFieldValue}
                        error={error?.financial_report_description}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
        </div>
    );
}

export default Operation;
