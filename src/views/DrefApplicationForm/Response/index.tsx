import React, { useMemo } from 'react';
import {
    randomString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    PartialForm,
    Error,
    EntriesAsList,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { AlertWarningLineIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import InputLabel from '#components/InputLabel';
import { sumSafe } from '#utils/common';
import RadioInput from '#components/RadioInput';
import GoSingleFileInput from '#components/GoSingleFileInput';
import {
    BooleanValueOption,
    StringValueOption,
} from '#types/common';
import useTranslation from '#hooks/useTranslation';

import InterventionInput from './InterventionInput';
import RiskSecurityInput from './RiskSecurityInput';
import {
    DrefFields,
    Intervention,
    booleanOptionKeySelector,
    optionLabelSelector,
    RiskSecurityProps,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import {
    InterventionType,
    RiskSecurityType,
} from '../useDrefFormOptions';

import i18n from './i18n.json';
import styles from './styles.module.css';

const emptyList: string[] = [];
type Value = PartialForm<DrefFields>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    interventionOptions: StringValueOption[];
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    yesNoOptions: BooleanValueOption[];
    drefType?: number;
}

function Response(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        onValueChange,
        interventionOptions,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        value,
        yesNoOptions,
        drefType,
    } = props;

    const error = getErrorObject(formError);

    const [intervention, setIntervention] = React.useState<string | undefined>();
    const {
        setValue: onInterventionChange,
        removeValue: onInterventionRemove,
    } = useFormArray<'planned_interventions', PartialForm<Intervention>>(
        'planned_interventions',
        onValueChange,
    );

    type Interventions = typeof value.planned_interventions;
    const handleInterventionAddButtonClick = React.useCallback((title: string | undefined) => {
        const clientId = randomString();
        const newInterventionList: PartialForm<InterventionType> = {
            clientId,
            title,
        };

        onValueChange(
            (oldValue: PartialForm<Interventions>) => (
                [...(oldValue ?? []), newInterventionList]
            ),
            'planned_interventions' as const,
        );
        setIntervention(undefined);
    }, [onValueChange, setIntervention]);

    const interventionsIdentifiedMap = React.useMemo(() => (
        listToMap(
            value.planned_interventions,
            (pi) => pi.title ?? '',
            () => true,
        )
    ), [value.planned_interventions]);

    const warnings = React.useMemo(() => {
        if (isNotDefined(value?.total_targeted_population)) {
            return emptyList;
        }

        const w = [];

        if (value?.num_assisted !== value?.total_targeted_population) {
            w.push('Total targeted population is different from that in Operation Overview');
        }

        if (!value.is_assessment_report && sumSafe([
            value?.women,
            value?.men,
            value?.girls,
            value?.boys,
        ]) !== value?.total_targeted_population) {
            w.push('Total targeted population is not equal to sum of other population fields');
        }

        return w;
    }, [
        value?.is_assessment_report,
        value?.num_assisted,
        value?.women,
        value?.men,
        value?.girls,
        value?.boys,
        value?.total_targeted_population,
    ]);

    const filteredInterventionOptions = useMemo(
        () => (
            interventionsIdentifiedMap
                ? interventionOptions.filter((n) => !interventionsIdentifiedMap[n.value])
                : []
        ),
        [
            interventionsIdentifiedMap,
            interventionOptions,
        ],
    );

    const isSurgePersonnelDeployed = value?.is_surge_personnel_deployed;

    const {
        setValue: onRiskSecurityChange,
        removeValue: onRiskSecurityRemove,
    } = useFormArray<'risk_security', PartialForm<RiskSecurityProps>>(
        'risk_security',
        onValueChange,
    );

    type riskSecurity = typeof value.risk_security;

    const handleRiskSecurityAdd = React.useCallback(() => {
        const clientId = randomString();
        const newRiskSecurityList: PartialForm<RiskSecurityType> = {
            clientId,
        };

        onValueChange(
            (oldValue: PartialForm<riskSecurity>) => (
                [...(oldValue ?? []), newRiskSecurityList]
            ),
            'risk_security' as const,
        );
    }, [onValueChange]);

    const totalBudgetFromInterventions = React.useMemo(
        () => sumSafe(value?.planned_interventions?.map((pi) => pi.budget) ?? []),
        [value?.planned_interventions],
    );

    // NOTE: || used intentionally instead of ??
    const plannedBudgetMatchRequestedAmount = (
        value?.amount_requested || 0
    ) === totalBudgetFromInterventions;

    return (
        <>
            <Container
                heading={strings.drefFormObjectiveAndStrategy}
                className={styles.objectiveRationale}
            >
                <InputSection
                    title={strings.drefFormObjectiveOperation}
                >
                    <TextArea
                        name="operation_objective"
                        onChange={onValueChange}
                        value={value.operation_objective}
                        error={error?.operation_objective}
                        placeholder={strings.drefFormObjectiveOperationPlaceholder}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormResponseRationale}
                    description={drefType === TYPE_ASSESSMENT
                        && strings.drefFormResponseRationaleDescription}
                >
                    <TextArea
                        name="response_strategy"
                        onChange={onValueChange}
                        value={value.response_strategy}
                        error={error?.response_strategy}
                        placeholder={strings.drefFormResponseRationalePlaceholder}
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
                        label={strings.drefFormDescription}
                        name="people_assisted"
                        onChange={onValueChange}
                        value={value.people_assisted}
                        error={error?.people_assisted}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormSelectionCriteria}
                    description={strings.drefFormSelectionCriteriaDescription}
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="selection_criteria"
                        onChange={onValueChange}
                        value={value.selection_criteria}
                        error={error?.selection_criteria}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormAssistedPopulation}
                className={styles.assistedPopulation}
                headerDescription={(
                    drefType !== TYPE_ASSESSMENT
                    && warnings?.map((w) => (
                        <div
                            className={styles.warning}
                            key={w}
                        >
                            <AlertWarningLineIcon />
                            {w}
                        </div>
                    ))
                )}
            >
                <InputSection
                    title={strings.drefFormTargetedPopulation}
                    multiRow
                    twoColumn
                >
                    {drefType !== TYPE_ASSESSMENT && (
                        <>
                            <NumberInput
                                label={strings.drefFormWomen}
                                name="women"
                                value={value.women}
                                onChange={onValueChange}
                                error={error?.women}
                            />
                            <NumberInput
                                label={strings.drefFormMen}
                                name="men"
                                value={value.men}
                                onChange={onValueChange}
                                error={error?.men}
                            />
                            <NumberInput
                                label={strings.drefFormGirls}
                                name="girls"
                                value={value.girls}
                                onChange={onValueChange}
                                error={error?.girls}
                            />
                            <NumberInput
                                label={strings.drefFormBoys}
                                name="boys"
                                value={value.boys}
                                onChange={onValueChange}
                                error={error?.boys}
                            />
                        </>
                    )}
                    <NumberInput
                        label={strings.drefFormTotal}
                        name="total_targeted_population"
                        value={value.total_targeted_population}
                        onChange={onValueChange}
                        error={error?.total_targeted_population}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormEstimateResponse}
                    multiRow
                    twoColumn
                >
                    <NumberInput
                        label={strings.drefFormEstimatePeopleDisability}
                        name="disability_people_per"
                        value={value.disability_people_per}
                        onChange={onValueChange}
                        error={error?.disability_people_per}
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
                                onChange={onValueChange}
                                error={error?.people_per_urban}
                            />
                            <NumberInput
                                placeholder={strings.drefFormEstimatedLocal}
                                name="people_per_local"
                                value={value.people_per_local}
                                onChange={onValueChange}
                                error={error?.people_per_local}
                            />
                        </div>
                    </div>
                    <NumberInput
                        label={strings.drefFormEstimatedDisplacedPeople}
                        name="displaced_people"
                        value={value.displaced_people}
                        onChange={onValueChange}
                        error={error?.displaced_people}
                    />
                    {drefType === TYPE_IMMINENT
                        && (
                            <NumberInput
                                label={strings.drefFormPeopleTargetedWithEarlyActions}
                                name="people_targeted_with_early_actions"
                                value={value.people_targeted_with_early_actions}
                                onChange={onValueChange}
                                error={error?.people_targeted_with_early_actions}
                            />
                        )}
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormRiskSecurity}
            >
                <InputSection
                    title={strings.drefFormRiskSecurityPotentialRisk}
                    description={drefType === TYPE_ASSESSMENT
                        && strings.drefFormRiskSecurityPotentialRiskDescription}
                    multiRow
                    oneColumn
                >
                    {value.risk_security?.map((rs, i) => (
                        <RiskSecurityInput
                            key={rs.clientId}
                            index={i}
                            value={rs}
                            onChange={onRiskSecurityChange}
                            onRemove={onRiskSecurityRemove}
                            error={getErrorObject(error?.risk_security)}
                        />
                    ))}
                    <div className={styles.actions}>
                        <Button
                            name={undefined}
                            onClick={handleRiskSecurityAdd}
                            variant="secondary"
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
                        onChange={onValueChange}
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
                        onChange={onValueChange}
                        url="api/v2/dref-files/"
                        value={value?.budget_file}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                    >
                        {strings.drefFormBudgetTemplateUploadButtonLabel}
                    </GoSingleFileInput>
                </InputSection>
                <InputSection
                    normalDescription
                    description={!plannedBudgetMatchRequestedAmount && (
                        <div className={styles.warning}>
                            {strings.drefFormResponseTotalAmountOfPlannedBudget}
                        </div>
                    )}
                >
                    <SelectInput
                        label={strings.drefFormInterventionsLabel}
                        name={undefined}
                        // FIXME
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onChange={setIntervention}
                        keySelector={(d) => d.value}
                        value={intervention}
                        options={filteredInterventionOptions}
                    />
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            name={intervention}
                            onClick={handleInterventionAddButtonClick}
                            disabled={isNotDefined(intervention)}
                        >
                            {strings.drefFormResponseAddButton}
                        </Button>
                    </div>
                </InputSection>
                {value?.planned_interventions?.map((n, i) => (
                    <InterventionInput
                        key={n.clientId}
                        index={i}
                        value={n}
                        onChange={onInterventionChange}
                        onRemove={onInterventionRemove}
                        error={getErrorObject(error?.planned_interventions)}
                        interventionOptions={interventionOptions}
                        showNewFieldOperational={false}
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
                        label={strings.drefFormDescription}
                        name="human_resource"
                        onChange={onValueChange}
                        value={value.human_resource}
                        error={error?.human_resource}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormSurgePersonnelDeployed}
                    description={isSurgePersonnelDeployed
                        && strings.drefFormSurgePersonnelDeployedDescription}
                    oneColumn
                    multiRow
                >
                    <RadioInput
                        name="is_surge_personnel_deployed"
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={value.is_surge_personnel_deployed}
                        onChange={onValueChange}
                        error={error?.is_surge_personnel_deployed}
                    />
                    {isSurgePersonnelDeployed
                        && (
                            <TextArea
                                label={strings.drefFormDescription}
                                name="surge_personnel_deployed"
                                onChange={onValueChange}
                                value={value.surge_personnel_deployed}
                                error={error?.surge_personnel_deployed}
                                placeholder={strings.drefFormSurgePersonnelDeployedDescription}
                            />
                        )}
                </InputSection>
                {drefType !== TYPE_ASSESSMENT && (
                    <>
                        <InputSection
                            title={strings.drefFormLogisticCapacityOfNs}
                            description={strings.drefFormLogisticCapacityOfNsDescription}
                        >
                            <TextArea
                                label={strings.drefFormDescription}
                                name="logistic_capacity_of_ns"
                                onChange={onValueChange}
                                value={value.logistic_capacity_of_ns}
                                error={error?.logistic_capacity_of_ns}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormPmer}
                            description={strings.drefFormPmerDescription}
                        >
                            <TextArea
                                label={strings.drefFormDescription}
                                name="pmer"
                                onChange={onValueChange}
                                value={value.pmer}
                                error={error?.pmer}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.drefFormCommunication}
                            description={strings.drefFormCommunicationDescription}
                        >
                            <TextArea
                                label={strings.drefFormDescription}
                                name="communication"
                                onChange={onValueChange}
                                value={value.communication}
                                error={error?.communication}
                            />
                        </InputSection>
                    </>
                )}
            </Container>
        </>
    );
}

export default Response;
