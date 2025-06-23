import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ErrorWarningFillIcon,
    WikiHelpSectionLineIcon,
} from '@ifrc-go/icons';
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
import { type GoApiResponse } from '#utils/restRequest';

import {
    calculateTotalAssistedPopulation,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialFinalReport } from '../schema';
import InterventionInput from './InterventionInput';
import RiskSecurityInput from './RiskSecurityInput';

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

const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

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
        setValue,
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

    const onPopulationChange = useCallback((
        val: number | undefined,
        name: 'assisted_num_of_women' | 'assisted_num_of_men' | 'assisted_num_of_girls_under_18' | 'assisted_num_of_boys_under_18',
    ) => {
        setValue(
            (oldValue: PartialFinalReport | undefined) => {
                const newValue = {
                    ...oldValue,
                    [name]: val,
                };
                return {
                    ...newValue,
                    num_assisted: calculateTotalAssistedPopulation(newValue),
                };
            },
        );
    }, [
        setValue,
    ]);

    const warnings = useMemo(() => {
        if (isNotDefined(value?.num_assisted)) {
            return [];
        }

        const w = [];

        if (sumSafe([
            value?.assisted_num_of_women,
            value?.assisted_num_of_men,
            value?.assisted_num_of_girls_under_18,
            value?.assisted_num_of_boys_under_18,
        ]) !== value?.num_assisted) {
            w.push(strings.drefFinalReportTotalTargeted);
        }

        return w;
    }, [
        strings.drefFinalReportTotalTargeted,
        value?.assisted_num_of_women,
        value?.assisted_num_of_men,
        value?.assisted_num_of_girls_under_18,
        value?.assisted_num_of_boys_under_18,
        value?.num_assisted,
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
                                name="assisted_num_of_women"
                                value={value.assisted_num_of_women}
                                onChange={onPopulationChange}
                                error={error?.assisted_num_of_women}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormMen}
                                name="assisted_num_of_men"
                                value={value.assisted_num_of_men}
                                onChange={onPopulationChange}
                                error={error?.assisted_num_of_men}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormGirls}
                                name="assisted_num_of_girls_under_18"
                                value={value.assisted_num_of_girls_under_18}
                                onChange={onPopulationChange}
                                error={error?.assisted_num_of_girls_under_18}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormBoys}
                                name="assisted_num_of_boys_under_18"
                                value={value.assisted_num_of_boys_under_18}
                                onChange={onPopulationChange}
                                error={error?.assisted_num_of_boys_under_18}
                                disabled={disabled}
                            />
                        </>
                    )}
                    <NumberInput
                        label={(
                            <>
                                {strings.drefFormPeopleAssisted}
                                <Link
                                    title={strings.drefFormOperationClickEmergencyResponseFramework}
                                    href={peopleTargetedLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        name="num_assisted"
                        value={value?.num_assisted}
                        onChange={setFieldValue}
                        error={error?.num_assisted}
                        hint={strings.drefFormPeopleAssistedDescription}
                        disabled={disabled}
                    />
                    {/* NOTE: Empty div to preserve the layout */}
                    <div />
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
            >
                <InputSection
                    title={strings.finalReportTotalAllocation}
                    description={(
                        <>
                            {strings.drefFinalReportRequestAmountDescription}
                            <ul>
                                <li>
                                    {resolveToComponent(
                                        strings.drefFinalReportRequestAmountDescriptionPoint1,
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
                                    {strings.drefFinalReportRequestAmountDescriptionPoint2}
                                </li>
                                <li>
                                    {strings.drefFinalReportRequestAmountDescriptionPoint3}
                                </li>
                                <li>
                                    {strings.drefFinalReportRequestAmountDescriptionPoint4}
                                </li>
                                <li>
                                    {strings.drefFinalReportRequestAmountDescriptionPoint5}
                                </li>
                            </ul>
                        </>
                    )}

                >
                    <NumberInput
                        name="total_dref_allocation"
                        value={value.total_dref_allocation}
                        error={error?.total_dref_allocation}
                        onChange={undefined}
                        readOnly
                        disabled={disabled}
                    />
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
                    {strings.drefFormUploadTargetingSupportingDescription}
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
