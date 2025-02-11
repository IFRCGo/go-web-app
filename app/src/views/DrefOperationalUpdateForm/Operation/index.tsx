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
    resolveToComponent,
    stringValueSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    type SetBaseValueArg,
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
    calculateTotalTargetedPopulation,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialOpsUpdate } from '../schema';
import InterventionInput from './InterventionInput';
import RiskSecurityInput from './RiskSecurityInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PlannedInterventionOption = NonNullable<GlobalEnumsResponse['dref_planned_intervention_title']>[number];

type Value = PartialOpsUpdate;
type PlannedInterventionFormFields = NonNullable<PartialOpsUpdate['planned_interventions']>[number];
type RiskSecurityFormFields = NonNullable<PartialOpsUpdate['risk_security']>[number];

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
    peopleTargetedWarning: string | undefined;
    budgetWarning: string | undefined;
}

function Operation(props: Props) {
    const strings = useTranslation(i18n);
    const {
        dref_planned_intervention_title: plannedInterventionOptions,
    } = useGlobalEnums();

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
        peopleTargetedWarning,
        budgetWarning,
    } = props;

    const error = getErrorObject(formError);

    const {
        response: globalFilesResponse,
    } = useRequest({
        url: '/api/v2/dref/global-files/',
    });

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
            w.push(strings.drefOperationalUpdateFormTotalTargetedPopulation);
        }

        return w;
    }, [
        strings.drefOperationalUpdateFormTotalTargetedPopulation,
        value?.women,
        value?.men,
        value?.girls,
        value?.boys,
        value?.total_targeted_population,
    ]);

    // FIXME: we might need to use this in DREF form as well
    const warningsBudget = useMemo(() => {
        if (isNotDefined(value?.total_dref_allocation)) {
            return [];
        }

        const w = [];

        const totalBudget = sumSafe(value?.planned_interventions?.map((item) => item.budget));

        if (totalBudget !== value?.total_dref_allocation) {
            w.push(strings.drefOperationalUpdateFormTotalDrefAllocation);
        }
        return w;
    }, [
        value?.total_dref_allocation,
        value?.planned_interventions,
        strings.drefOperationalUpdateFormTotalDrefAllocation,
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

    const handleAdditionalAllocationChange = useCallback((
        additionalAllocation: number | undefined,
        name: 'additional_allocation',
    ) => {
        setFieldValue(additionalAllocation, name);
        setFieldValue(
            sumSafe([
                value.dref_allocated_so_far,
                additionalAllocation,
            ]),
            'total_dref_allocation',
        );
    }, [setFieldValue, value.dref_allocated_so_far]);

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

    const onPopulationChange = useCallback((
        val: number | undefined,
        name: 'men' | 'women' | 'girls' | 'boys',
    ) => {
        setValue(
            (oldValue: Value | undefined) => {
                const newValue = {
                    ...oldValue,
                    [name]: val,
                };
                return {
                    ...newValue,
                    total_targeted_population: calculateTotalTargetedPopulation(newValue),
                };
            },
        );
    }, [
        setValue,
    ]);

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
                    description={strings.drefFormObjectiveOperationDescription}
                >
                    <TextArea
                        name="operation_objective"
                        onChange={setFieldValue}
                        value={value.operation_objective}
                        error={error?.operation_objective}
                        hint={strings.drefFormObjectiveOperationPlaceholder}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormResponseRationale}
                    description={(
                        <>
                            <p>
                                {strings.drefFormResponseRationaleDescription}
                            </p>
                            <ul>
                                <li>
                                    {strings.drefFormResponseRationaleDescriptionPoint1}
                                </li>
                                <li>
                                    {strings.drefFormResponseRationaleDescriptionPoint2}
                                </li>
                                <li>
                                    {strings.drefFormResponseRationaleDescriptionPoint3}
                                </li>
                                <li>
                                    {strings.drefFormResponseRationaleDescriptionPoint4}
                                </li>
                                {value?.type_of_dref === TYPE_ASSESSMENT && (
                                    <li>
                                        {strings.drefFormResponseRationaleForAssessment}
                                    </li>
                                )}
                            </ul>
                        </>
                    )}
                >
                    <TextArea
                        name="response_strategy"
                        onChange={setFieldValue}
                        value={value.response_strategy}
                        error={error?.response_strategy}
                        hint={strings.drefFormResponseRationalePlaceholder}
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
                                onChange={onPopulationChange}
                                error={error?.women}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormMen}
                                name="men"
                                value={value.men}
                                onChange={onPopulationChange}
                                error={error?.men}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormGirls}
                                name="girls"
                                value={value.girls}
                                onChange={onPopulationChange}
                                error={error?.girls}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormBoys}
                                name="boys"
                                value={value.boys}
                                onChange={onPopulationChange}
                                error={error?.boys}
                                disabled={disabled}
                            />
                        </>
                    )}
                    <div>
                        <NumberInput
                            label={strings.drefFormTotal}
                            name="total_targeted_population"
                            value={value.total_targeted_population}
                            onChange={setFieldValue}
                            error={error?.total_targeted_population}
                            disabled={disabled}
                        />
                        {peopleTargetedWarning && (
                            <div className={styles.warning}>
                                <ErrorWarningFillIcon className={styles.icon} />
                                {peopleTargetedWarning}
                            </div>
                        )}
                    </div>
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
                    title={strings.drefFormRiskDoesNSHaveAntiFraudPolicy}
                >
                    <BooleanInput
                        name="has_anti_fraud_corruption_policy"
                        value={value.has_anti_fraud_corruption_policy}
                        onChange={setFieldValue}
                        error={error?.has_anti_fraud_corruption_policy}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskDoesNSHaveSexualAbusePolicy}
                >
                    <BooleanInput
                        name="has_sexual_abuse_policy"
                        value={value.has_sexual_abuse_policy}
                        onChange={setFieldValue}
                        error={error?.has_sexual_abuse_policy}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskDoesNSHaveChildProtectionPolicy}
                >
                    <BooleanInput
                        name="has_child_protection_policy"
                        value={value.has_child_protection_policy}
                        onChange={setFieldValue}
                        error={error?.has_child_protection_policy}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskDoesNSHaveWhistleblowerPolicy}
                >
                    <BooleanInput
                        name="has_whistleblower_protection_policy"
                        value={value.has_whistleblower_protection_policy}
                        onChange={setFieldValue}
                        error={error?.has_whistleblower_protection_policy}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskDoesNSHaveAntiSexualHarassmentPolicy}
                >
                    <BooleanInput
                        name="has_anti_sexual_harassment_policy"
                        value={value.has_anti_sexual_harassment_policy}
                        onChange={setFieldValue}
                        error={error?.has_anti_sexual_harassment_policy}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormRiskSecurityPotentialRisk}
                    description={(
                        <>
                            {value?.type_of_dref === TYPE_ASSESSMENT
                                && strings.drefFormRiskSecurityPotentialRiskAssessmentDescription}
                            {strings.drefFormRiskSecurityPotentialRiskDescription}
                            <Link
                                href="https://github.com/user-attachments/files/18903662/Annex.III.Risk.Categories.1.pdf"
                                withLinkIcon
                                external
                            >
                                {strings.drefFormRiskSecurityRiskCategoriesLinkLabel}
                            </Link>
                            {(value.risk_security?.length ?? 0) > 0 && (
                                <>
                                    <p>
                                        {strings.drefFormRiskSecurityRiskSelectedDescription}
                                    </p>
                                    <ul>
                                        <li>
                                            {strings.drefFormRiskSecurityRiskSelectedPoint1}
                                        </li>
                                        <li>
                                            {strings.drefFormRiskSecurityRiskSelectedPoint2}
                                        </li>
                                        <li>
                                            {strings.drefFormRiskSecurityRiskSelectedPoint3}
                                        </li>
                                        <li>
                                            {strings.drefFormRiskSecurityRiskSelectedPoint4}
                                        </li>
                                        <li>
                                            {strings.drefFormRiskSecurityRiskSelectedPoint5}
                                        </li>
                                    </ul>
                                </>
                            )}
                        </>
                    )}
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
                    description={(
                        <>
                            <p>
                                {strings.drefFormRiskSecuritySafetyConcernDescription}
                            </p>
                            <ul>
                                <li>
                                    {strings.drefFormRiskSecuritySafetyConcernDescriptionPoint1}
                                </li>
                                <li>
                                    {strings.drefFormRiskSecuritySafetyConcernDescriptionPoint2}
                                </li>
                                <li>
                                    {strings.drefFormRiskSecuritySafetyConcernDescriptionPoint3}
                                </li>
                            </ul>
                        </>
                    )}
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
            <Container
                heading={strings.drefFormPlannedIntervention}
                className={styles.plannedIntervention}
                headerDescription={(
                    warningsBudget?.map((w) => (
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
                    title={strings.drefOperationalUpdateAllocationSoFar}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        name="dref_allocated_so_far"
                        value={value.dref_allocated_so_far}
                        onChange={undefined}
                        error={error?.dref_allocated_so_far}
                        disabled={disabled}
                        readOnly
                    />
                </InputSection>
                <InputSection
                    title={strings.drefOperationalUpdateAdditionalAllocationRequested}
                    numPreferredColumns={2}
                >
                    <div>
                        <NumberInput
                            name="additional_allocation"
                            value={value.additional_allocation}
                            onChange={handleAdditionalAllocationChange}
                            error={error?.additional_allocation}
                            disabled={disabled}
                        />
                        {budgetWarning && (
                            <div className={styles.warning}>
                                <ErrorWarningFillIcon className={styles.icon} />
                                {budgetWarning}
                            </div>
                        )}
                    </div>
                </InputSection>
                <InputSection
                    title={strings.drefOperationalUpdateTotalAllocation}
                    numPreferredColumns={2}
                    description={(
                        <>
                            {strings.drefOperationalUpdateRequestAmountDescription}
                            <ul>
                                <li>
                                    {resolveToComponent(
                                        strings.drefOperationalUpdateRequestAmountDescriptionPoint1,
                                        {
                                            indicatorDatabankLink: (
                                                <Link
                                                    href="https://github.com/user-attachments/files/18903662/Annex.III.Risk.Categories.1.pdf"
                                                    withLinkIcon
                                                    external
                                                >
                                                    {strings.drefIndicatorDataLinkLabel}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </li>
                                <li>
                                    {strings.drefOperationalUpdateRequestAmountDescriptionPoint2}
                                </li>
                                <li>
                                    {strings.drefOperationalUpdateRequestAmountDescriptionPoint3}
                                </li>
                                <li>
                                    {strings.drefOperationalUpdateRequestAmountDescriptionPoint4}
                                </li>
                                <li>
                                    {strings.drefOperationalUpdateRequestAmountDescriptionPoint5}
                                </li>
                            </ul>
                        </>
                    )}
                >
                    <NumberInput
                        name="total_dref_allocation"
                        value={value.total_dref_allocation}
                        onChange={undefined}
                        error={error?.total_dref_allocation}
                        disabled={disabled}
                        readOnly
                    />
                </InputSection>
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
                        description={(
                            <Link
                                href={globalFilesResponse?.budget_template_url}
                                withLinkIcon
                                external
                            >
                                {strings.drefFormDownloadBudgetTemplate}
                            </Link>
                        )}
                    >
                        {strings.drefFormBudgetTemplateUploadButtonLabel}
                    </GoSingleFileInput>
                </InputSection>
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
                heading={strings.drefFormSupportServices}
            >
                <InputSection
                    title={strings.drefFormHumanResourceTitle}
                    description={(
                        <>
                            {strings.drefFormHumanResourceDescription}
                            <ul>
                                <li>
                                    {strings.drefFormHumanResourceDescriptionPoint1}
                                </li>
                                <li>
                                    {strings.drefFormHumanResourceDescriptionPoint2}
                                </li>
                                <li>
                                    {strings.drefFormHumanResourceDescriptionPoint3}
                                </li>
                            </ul>
                        </>
                    )}
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
                    title={strings.drefFormIsVolunteerTeamDiverseTitle}
                    description={strings.drefFormIsVolunteerTeamDiverseDescription}
                >
                    <TextArea
                        name="is_volunteer_team_diverse"
                        label={strings.drefFormIsVolunteerTeamDiverseLabel}
                        value={value.is_volunteer_team_diverse}
                        onChange={setFieldValue}
                        error={error?.is_volunteer_team_diverse}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormSurgePersonnelDeployed}
                    description={value?.is_surge_personnel_deployed && (
                        <ul>
                            <li>
                                {strings.drefFormSurgePersonnelDeployedDescriptionPoint1}
                            </li>
                            <li>
                                {strings.drefFormSurgePersonnelDeployedDescriptionPoint2}
                            </li>
                            <li>
                                {strings.drefFormSurgePersonnelDeployedDescriptionPoint3}
                            </li>
                            <li>
                                {strings.drefFormSurgePersonnelDeployedDescriptionPoint4}
                            </li>
                        </ul>
                    )}
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
                            disabled={disabled}
                        />
                    )}
                </InputSection>
                {value?.type_of_dref !== TYPE_ASSESSMENT && (
                    <>
                        <InputSection
                            title={strings.drefFormLogisticCapacityOfNs}
                            description={(
                                <>
                                    {strings.drefFormLogisticCapacityOfNsDescription}
                                    <ul>
                                        <li>
                                            {strings.drefFormLogisticCapacityOfNsDescriptionPoint1}
                                        </li>
                                        <li>
                                            {strings.drefFormLogisticCapacityOfNsDescriptionPoint2}
                                        </li>
                                        <li>
                                            {strings.drefFormLogisticCapacityOfNsDescriptionPoint3}
                                        </li>
                                        <li>
                                            {strings.drefFormLogisticCapacityOfNsDescriptionPoint4}
                                        </li>
                                        <li>
                                            {strings.drefFormLogisticCapacityOfNsDescriptionPoint5}
                                        </li>
                                    </ul>
                                </>
                            )}
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
                            description={(
                                <>
                                    {strings.drefFormPmerDescription}
                                    <ul>
                                        <li>
                                            {strings.drefFormPmerDescriptionPoint1}
                                        </li>
                                        <li>
                                            {strings.drefFormPmerDescriptionPoint2}
                                        </li>
                                        <li>
                                            {strings.drefFormPmerDescriptionPoint3}
                                        </li>
                                        <li>
                                            {strings.drefFormPmerDescriptionPoint4}
                                        </li>
                                    </ul>
                                </>
                            )}
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
                            description={(
                                <>
                                    {strings.drefFormCommunicationDescription}
                                    <ul>
                                        <li>
                                            {strings.drefFormCommunicationDescriptionPoint1}
                                        </li>
                                        <li>
                                            {strings.drefFormCommunicationDescriptionPoint2}
                                        </li>
                                        <li>
                                            {strings.drefFormCommunicationDescriptionPoint3}
                                        </li>
                                        <li>
                                            {strings.drefFormCommunicationDescriptionPoint4}
                                        </li>
                                    </ul>
                                </>
                            )}
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
