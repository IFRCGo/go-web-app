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
import { type PartialDref } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PlannedInterventionOption = NonNullable<GlobalEnumsResponse['dref_planned_intervention_title']>[number];

type Value = PartialDref;
type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type RiskSecurityFormFields = NonNullable<PartialDref['risk_security']>[number];

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

        if (value?.num_assisted !== value?.total_targeted_population) {
            w.push(strings.drefFormTotalTargeted);
        }

        if (sumSafe([
            value?.women,
            value?.men,
            value?.girls,
            value?.boys,
        ]) !== value?.total_targeted_population) {
            w.push(strings.drefFormTotalTargetedPopulation);
        }

        return w;
    }, [
        strings.drefFormTotalTargeted,
        strings.drefFormTotalTargetedPopulation,
        value?.num_assisted,
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

    const totalBudgetFromInterventions = useMemo(
        () => sumSafe(value?.planned_interventions?.map((pi) => pi.budget)),
        [value?.planned_interventions],
    );

    // NOTE: || used intentionally instead of ??
    // But why?
    const plannedBudgetMatchRequestedAmount = (
        (value?.amount_requested || 0) === totalBudgetFromInterventions
    );

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
            </Container>
            <Container
                heading={strings.drefFormAssistedPopulation}
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
                    <GoSingleFileInput
                        accept=".pdf"
                        name="budget_file"
                        onChange={setFieldValue}
                        url="/api/v2/dref-files/"
                        value={value?.budget_file}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={error?.budget_file}
                        disabled={disabled}
                        clearable
                    >
                        {strings.drefFormBudgetTemplateUploadButtonLabel}
                    </GoSingleFileInput>
                </InputSection>
                <InputSection
                    description={!plannedBudgetMatchRequestedAmount && (
                        <div className={styles.warning}>
                            <ErrorWarningFillIcon className={styles.icon} />
                            {strings.drefFormResponseTotalAmountOfPlannedBudget}
                        </div>
                    )}
                >
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
                heading={strings.drefFormSupportServices}
            >
                <InputSection
                    title={strings.drefFormHumanResourceDescription}
                >
                    <TextArea
                        label={strings.drefFormOperationDescription}
                        name="human_resource"
                        onChange={setFieldValue}
                        value={value.human_resource}
                        error={error?.human_resource}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormSurgePersonnelDeployed}
                    description={value?.is_surge_personnel_deployed
                        ? strings.drefFormSurgePersonnelDeployedDescription
                        : undefined}
                >
                    <BooleanInput
                        name="is_surge_personnel_deployed"
                        value={value.is_surge_personnel_deployed}
                        onChange={setFieldValue}
                        error={error?.is_surge_personnel_deployed}
                        disabled={disabled}
                    />
                    {value?.is_surge_personnel_deployed && (
                        <TextArea
                            label={strings.drefFormOperationDescription}
                            name="surge_personnel_deployed"
                            onChange={setFieldValue}
                            value={value.surge_personnel_deployed}
                            error={error?.surge_personnel_deployed}
                            placeholder={strings.drefFormSurgePersonnelDeployedDescription}
                            disabled={disabled}
                        />
                    )}
                </InputSection>
                {value?.type_of_dref !== TYPE_ASSESSMENT && (
                    <>
                        <InputSection
                            title={strings.drefFormLogisticCapacityOfNs}
                            description={strings.drefFormLogisticCapacityOfNsDescription}
                        >
                            <TextArea
                                label={strings.drefFormOperationDescription}
                                name="logistic_capacity_of_ns"
                                onChange={setFieldValue}
                                value={value.logistic_capacity_of_ns}
                                error={error?.logistic_capacity_of_ns}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormPmer}
                            description={strings.drefFormPmerDescription}
                        >
                            <TextArea
                                label={strings.drefFormOperationDescription}
                                name="pmer"
                                onChange={setFieldValue}
                                value={value.pmer}
                                error={error?.pmer}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormCommunication}
                            description={strings.drefFormCommunicationDescription}
                        >
                            <TextArea
                                label={strings.drefFormOperationDescription}
                                name="communication"
                                onChange={setFieldValue}
                                value={value.communication}
                                error={error?.communication}
                                disabled={disabled}
                            />
                        </InputSection>
                    </>
                )}
            </Container>
        </div>
    );
}

export default Operation;
