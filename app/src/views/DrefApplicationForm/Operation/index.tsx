import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ErrorWarningFillIcon } from '@ifrc-go/icons';
import {
    BooleanInput,
    Button,
    Container,
    InputLabel,
    InputSection,
    NumberInput,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    stringValueSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    isCallable,
    type SetBaseValueArg,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import {
    EARLY_ACTIONS,
    EARLY_RESPONSE,
    recalculateProposedActionValues,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialDref } from '../schema';
import InterventionInput from './InterventionInput';
import ProposedActionsInput from './ProposedActionsInput';
import RiskSecurityInput from './RiskSecurityInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PlannedInterventionOption = NonNullable<GlobalEnumsResponse['dref_planned_intervention_title']>[number];
type ProposedActionOption = NonNullable<GlobalEnumsResponse['dref_proposed_action']>[number];

type Value = PartialDref;
type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type ProposedActionsFormFields = NonNullable<PartialDref['proposed_action']>[number];
type RiskSecurityFormFields = NonNullable<PartialDref['risk_security']>[number];
type ActivityOptions = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];

function activityKeySelector(option: ActivityOptions) {
    return option.key;
}

function activityLabelSelector(option: ActivityOptions) {
    return option.label;
}

function plannedInterventionKeySelector(option: PlannedInterventionOption) {
    return option.key;
}

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    setValue: (value: SetBaseValueArg<Value>, partialUpdate?: boolean) => void;
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
        setValue,
    } = props;

    const onProposedActionChange = useCallback(
        (val: SetValueArg<ProposedActionsFormFields>, index: number | undefined) => {
            setValue((oldVal) => {
                const newProposedValue = [...(oldVal.proposed_action ?? [])];
                if (isNotDefined(index)) {
                    newProposedValue.push(
                        isCallable(val) ? val(undefined) : val,
                    );
                } else {
                    newProposedValue[index] = isCallable(val)
                        ? val(newProposedValue[index])
                        : val;
                }

                const newValue = {
                    ...oldVal,
                    proposed_action: newProposedValue,
                };

                return {
                    ...newValue,
                    ...recalculateProposedActionValues(newValue),
                };
            }, true);
        },
        [setValue],
    );

    const onProposedActionRemove = useCallback(
        (index: number) => {
            setValue(
                (oldValue) => {
                    const newProposedValue = [...(oldValue.proposed_action ?? [])];
                    newProposedValue.splice(index, 1);

                    return {
                        ...oldValue,
                        proposed_action: newProposedValue,
                    };
                },
                true,
            );
        },
        [setValue],
    );

    const error = getErrorObject(formError);

    const [
        selectedIntervention,
        setSelectedIntervention,
    ] = useState<PlannedInterventionOption['key'] | undefined>();

    const [
        selectedEarlyActionsActivity,
        setSelectedEarlyActionsActivity,
    ] = useState<ActivityOptions['key'] | undefined>();

    const [
        selectedEarlyResponseActivity,
        setSelectedEarlyResponseActivity,
    ] = useState<ActivityOptions['key'] | undefined>();

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

    const {
        pending: activityOptionPending,
        response: activityOptionResponse,
    } = useRequest({
        url: '/api/v2/primarysector',
    });

    const handleSurgeDeployedChange = useCallback(
        (val: PartialDref['is_surge_personnel_deployed'] | undefined) => (
            setValue((oldValue) => {
                const newValue = {
                    ...oldValue,
                    is_surge_personnel_deployed: val,
                };
                return {
                    ...newValue,
                    ...recalculateProposedActionValues(newValue),
                };
            }, true)
        ),
        [setValue],
    );

    const handleInterventionAddButtonClick = useCallback((title: PlannedInterventionOption['key'] | undefined) => {
        const newInterventionItem: PlannedInterventionFormFields = {
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

    const proposedActionsByType = useMemo(() => (
        listToGroupList(
            (value?.proposed_action ?? []).filter((proposed) => isDefined(proposed.proposed_type)),
            (proposed) => proposed.proposed_type ?? 0,
            (proposed, _, index) => ({
                ...proposed,
                mainIndex: index,
            }),
        )
    ), [value?.proposed_action]);

    const handleEarlyActionsActivityAddButtonClick = useCallback((name: ProposedActionOption['key']) => {
        const newProposedActionItem: ProposedActionsFormFields = {
            client_id: randomString(),
            proposed_type: name,
            activity: selectedEarlyActionsActivity,
        };

        setFieldValue(
            (oldValue: ProposedActionsFormFields[] | undefined) => (
                [...(oldValue ?? []), newProposedActionItem]
            ),
            'proposed_action' as const,
        );
        setSelectedEarlyActionsActivity(undefined);
    }, [setFieldValue, selectedEarlyActionsActivity]);

    const handleEarlyResponseActivityAddButtonClick = useCallback((name: ProposedActionOption['key']) => {
        const newProposedActionItem: ProposedActionsFormFields = {
            client_id: randomString(),
            proposed_type: name,
            activity: selectedEarlyResponseActivity,
        };

        setFieldValue(
            (oldValue: ProposedActionsFormFields[] | undefined) => (
                [...(oldValue ?? []), newProposedActionItem]
            ),
            'proposed_action' as const,
        );
        setSelectedEarlyResponseActivity(undefined);
    }, [setFieldValue, selectedEarlyResponseActivity]);

    const earlyActionActivitiesSelectedOptionsMap = useMemo(() => {
        const earlyActionProposedActionValue = value.proposed_action?.filter(
            (action) => action.proposed_type === EARLY_ACTIONS,
        );

        return listToMap(
            earlyActionProposedActionValue,
            (proposedAction) => proposedAction.activity ?? '<no-key>',
            (proposedAction) => ({
                type: proposedAction.proposed_type,
                isFilter: true,
            }),
        );
    }, [value.proposed_action]);

    const earlyResponseActivitiesSelectedOptionsMap = useMemo(() => {
        const earlyResponseProposedActionValue = value.proposed_action?.filter(
            (action) => action.proposed_type === EARLY_RESPONSE,
        );

        return listToMap(
            earlyResponseProposedActionValue,
            (proposedAction) => proposedAction.activity ?? '<no-key>',
            (proposedAction) => ({
                type: proposedAction.proposed_type,
                isFilter: true,
            }),
        );
    }, [value.proposed_action]);

    const filteredEarlyActionActivityOptions = useMemo(() => (
        activityOptionResponse?.filter(
            (response) => !earlyActionActivitiesSelectedOptionsMap?.[response.key]?.isFilter,
        )
    ), [activityOptionResponse, earlyActionActivitiesSelectedOptionsMap]);

    const filteredEarlyResponseActivityOptions = useMemo(() => (
        activityOptionResponse?.filter(
            (response) => !earlyResponseActivitiesSelectedOptionsMap?.[response.key]?.isFilter,
        )
    ), [activityOptionResponse, earlyResponseActivitiesSelectedOptionsMap]);

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
            {value?.type_of_dref !== TYPE_IMMINENT && (
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
            )}
            {value?.type_of_dref !== TYPE_IMMINENT && (
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
                    <InputSection title={strings.drefFormUploadTargetingSupportingDocument}>
                        <GoSingleFileInput
                            name="targeting_strategy_support_file"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/dref-files/"
                            value={value.targeting_strategy_support_file}
                            error={error?.targeting_strategy_support_file}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                        >
                            {strings.drefFormUploadSupportingDocumentButtonLabel}
                        </GoSingleFileInput>
                    </InputSection>
                </Container>
            )}
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
            {value?.type_of_dref !== TYPE_IMMINENT && (
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
                        description={(
                            <>
                                {strings.drefFormRiskSecurityHasChildRiskCompletedDescription}
                                <Link
                                    href="https://www.ifrc.org/document/child-safeguarding-policy"
                                    withLinkIcon
                                    external
                                >
                                    {strings.drefChildSafeguardingPolicyDescription}
                                </Link>
                                <Link
                                    href="https://pgi.ifrc.org/resources/qa-child-safeguarding-risk-analysis-ifrc-programmes"
                                    withLinkIcon
                                    external
                                >
                                    {strings.drefChildSafeguardingRiskAnalysisDescription}
                                </Link>
                            </>
                        )}
                    >
                        <BooleanInput
                            name="has_child_safeguarding_risk_analysis_assessment"
                            value={value.has_child_safeguarding_risk_analysis_assessment}
                            onChange={setFieldValue}
                            error={error?.has_child_safeguarding_risk_analysis_assessment}
                        />
                    </InputSection>
                </Container>
            )}
            {value?.type_of_dref !== TYPE_IMMINENT && (
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
                        title={strings.drefFormRequestAmount}
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            name="amount_requested"
                            value={value?.amount_requested}
                            onChange={setFieldValue}
                            error={error?.amount_requested}
                            disabled={disabled}
                        />
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
            )}
            <Container
                heading={strings.drefFormSupportServices}
            >
                {value?.type_of_dref !== TYPE_IMMINENT && (
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
                )}
                <InputSection
                    title={strings.drefFormSurgePersonnelDeployed}
                    description={value?.is_surge_personnel_deployed
                        ? strings.drefFormSurgePersonnelDeployedDescription
                        : undefined}
                >
                    <BooleanInput
                        name="is_surge_personnel_deployed"
                        value={value.is_surge_personnel_deployed}
                        onChange={handleSurgeDeployedChange}
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
                {value?.type_of_dref === TYPE_IMMINENT && (
                    <InputSection
                        title={strings.drefHumanitarianTitle}
                        description={strings.drefHumanitarianDescription}
                    >
                        <TextArea
                            name="addressed_humanitarian_impacts"
                            onChange={setFieldValue}
                            value={value.addressed_humanitarian_impacts}
                            error={error?.addressed_humanitarian_impacts}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                {value.type_of_dref === TYPE_IMMINENT && (
                    <InputSection
                        title={strings.drefFormUploadSupportingDocumentButtonLabel}
                        description={strings.drefUploadSupportingDocumentTitle}
                    >
                        <GoSingleFileInput
                            name="contingency_plans_supporting_document"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/dref-files/"
                            value={value.contingency_plans_supporting_document}
                            error={error?.contingency_plans_supporting_document}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                        >
                            {strings.drefFormOperationUploadDocumentButtonLabel}
                        </GoSingleFileInput>
                    </InputSection>
                )}
                {value?.type_of_dref !== TYPE_ASSESSMENT
                    && value?.type_of_dref !== TYPE_IMMINENT && (
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
            {value?.type_of_dref === TYPE_IMMINENT && (
                <Container
                    heading={strings.drefFormProposedActions}
                >
                    <InputSection
                        title={strings.drefFormProposedActionEarlyActionsLabel}
                    >
                        <div className={styles.selectionContainer}>
                            <SelectInput
                                className={styles.input}
                                name={undefined}
                                label={strings.drefFormProposedActionSelectActivitiesLabel}
                                value={selectedEarlyActionsActivity}
                                onChange={setSelectedEarlyActionsActivity}
                                keySelector={activityKeySelector}
                                labelSelector={activityLabelSelector}
                                options={filteredEarlyActionActivityOptions}
                                disabled={disabled || activityOptionPending}
                            />
                            <Button
                                name={EARLY_ACTIONS}
                                variant="secondary"
                                spacing="compact"
                                onClick={handleEarlyActionsActivityAddButtonClick}
                                disabled={
                                    isNotDefined(selectedEarlyActionsActivity)
                                        || disabled
                                }
                            >
                                {strings.drefFormProposedActionAddActivityLabel}
                            </Button>
                        </div>
                        <NonFieldError error={getErrorObject(error?.proposed_action)} />
                        {proposedActionsByType[EARLY_ACTIONS]?.map((action) => (
                            <ProposedActionsInput
                                key={action.client_id}
                                index={action.mainIndex}
                                value={action}
                                activityOptions={activityOptionResponse}
                                onChange={onProposedActionChange}
                                onRemove={onProposedActionRemove}
                                error={getErrorObject(error?.proposed_action)}
                            />
                        ))}
                    </InputSection>
                    <InputSection
                        title={strings.drefFormProposedActionEarlyResponseLabel}
                    >
                        <div className={styles.selectionContainer}>
                            <SelectInput
                                className={styles.input}
                                name={undefined}
                                label={strings.drefFormProposedActionSelectActivitiesLabel}
                                value={selectedEarlyResponseActivity}
                                onChange={setSelectedEarlyResponseActivity}
                                keySelector={activityKeySelector}
                                labelSelector={activityLabelSelector}
                                options={filteredEarlyResponseActivityOptions}
                                disabled={disabled || activityOptionPending}
                            />
                            <Button
                                name={EARLY_RESPONSE}
                                variant="secondary"
                                spacing="compact"
                                onClick={handleEarlyResponseActivityAddButtonClick}
                                disabled={
                                    isNotDefined(selectedEarlyResponseActivity)
                                        || disabled
                                }
                            >
                                {strings.drefFormProposedActionAddActivityLabel}
                            </Button>
                        </div>
                        <NonFieldError error={getErrorObject(error?.proposed_action)} />
                        {proposedActionsByType[EARLY_RESPONSE]?.map((action) => (
                            <ProposedActionsInput
                                key={action.client_id}
                                index={action.mainIndex}
                                value={action}
                                activityOptions={activityOptionResponse}
                                onChange={onProposedActionChange}
                                onRemove={onProposedActionRemove}
                                error={getErrorObject(error?.proposed_action)}
                            />
                        ))}
                    </InputSection>
                    <InputSection
                        description={(
                            <div className={styles.warning}>
                                <ErrorWarningFillIcon className={styles.icon} />
                                {strings.drefFormProposedActionSelectBudgetNote}
                            </div>
                        )}
                    >
                        <NumberInput
                            required
                            name="sub_total"
                            readOnly
                            onChange={setFieldValue}
                            label={strings.drefFormProposedActionSubTotal}
                            value={value.sub_total}
                            disabled={disabled}
                        />
                        <NonFieldError
                            error={error?.sub_total}
                        />
                        {value.is_surge_personnel_deployed && (
                            <NumberInput
                                required
                                readOnly
                                name="surge_deployment_cost"
                                onChange={setFieldValue}
                                label={strings.drefFormProposedActionSurgeDeployment}
                                value={value.surge_deployment_cost}
                                error={error?.surge_deployment_cost}
                                disabled={disabled}
                            />
                        )}
                        <NumberInput
                            required
                            readOnly
                            name="indirect_cost"
                            onChange={setFieldValue}
                            label={strings.drefFormProposedActionIndirectCost}
                            value={value.indirect_cost}
                            error={error?.indirect_cost}
                            disabled={disabled}
                        />
                        <NumberInput
                            required
                            readOnly
                            name="total"
                            onChange={setFieldValue}
                            label={strings.drefFormProposedActionTotal}
                            value={value.total}
                            error={error?.total}
                            disabled={disabled}
                        />
                    </InputSection>
                </Container>
            )}
        </div>
    );
}

export default Operation;
