import {
    Fragment,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    ExpandableContainer,
    Label,
    ListView,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { DescriptionText } from '@ifrc-go/ui/printable';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isFalsyString,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import ClampedContent from '#components/ClampedContent';
import DrefSummaryDisclaimer from '#components/domain/DrefSummaryDisclaimer';
import DrefSummarySourceLabel from '#components/domain/DrefSummarySourceLabel';
import SectorIcon from '#components/domain/SectorIcon';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import {
    type EmergencyDrefRevisionKind,
    getDrefSummary,
    getEmergencyDrefStrategy,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedIntervention = components<'read'>['schemas']['PlannedIntervention'];
type InterventionTitle = components<'read'>['schemas']['DrefPlannedInterventionTitleEnumKey'];
type NeedTitle = components<'read'>['schemas']['DrefIdentifiedNeedTitleEnumKey'];

// auto-bulleting text areas persist "• " as soon as an empty field is focused,
// so a value can be non-empty yet render blank. Trimming alone leaves "•".
const BLANK_CONTENT_PATTERN = /^[\s•]*$/;
function hasContent(value: string | null | undefined) {
    return isTruthyString(value) && !BLANK_CONTENT_PATTERN.test(value);
}

// needs are recorded per sector for the operation, so each intervention shows
// the one matching its sector. These two titles differ between the enums, and
// coordination / secretariat / NS strengthening have no need counterpart.
const NEED_TITLE_BY_INTERVENTION_TITLE: Partial<Record<InterventionTitle, NeedTitle>> = {
    multi_purpose_cash: 'multi_purpose_cash_grants',
    environmental_sustainability: 'environment_sustainability',
};

interface InterventionProps {
    data: PlannedIntervention;
    revisionKind: EmergencyDrefRevisionKind;
    needDescription: string | undefined;
}

function Intervention(props: InterventionProps) {
    const {
        data: intervention,
        revisionKind,
        needDescription,
    } = props;

    const strings = useTranslation(i18n);
    const isApplication = revisionKind === 'application';
    // person_assisted is only captured by the final report form
    const showPeopleReached = revisionKind === 'final-report';

    // each revision contributes one field beside Needs
    const stageBox = {
        application: {
            heading: strings.plannedOperationPriorityActionsHeading,
            content: intervention.description,
        },
        'operational-update': {
            heading: strings.plannedOperationProgressSoFarHeading,
            content: intervention.progress_towards_outcome,
        },
        'final-report': {
            heading: strings.plannedOperationAchievementsHeading,
            content: intervention.narrative_description_of_achievements,
        },
    }[revisionKind];

    const boxes = [
        {
            key: 'needs',
            heading: strings.plannedOperationNeedsHeading,
            content: needDescription,
        },
        {
            key: 'stage',
            ...stageBox,
        },
        {
            key: 'activities',
            heading: strings.plannedOperationActivitiesHeading,
            // the application already shows description as its priority actions
            content: isApplication ? undefined : intervention.description,
        },
    ].filter(({ content }) => hasContent(content));

    const hasIndicators = (intervention.indicators?.length ?? 0) > 0;

    return (
        <ExpandableContainer
            withShadow
            withBackground
            withPadding
            headingLevel={5}
            headerIcons={(
                <img
                    className={styles.sectorImage}
                    src={intervention.image_url}
                    alt={intervention.title}
                />
            )}
            heading={intervention.title_display}
            withHeaderBorder
            withoutWrapInHeader
            headerDescription={(
                <ListView
                    layout="grid"
                    numPreferredGridColumns={showPeopleReached ? 3 : 2}
                    minGridColumnSize="10rem"
                >
                    <TextOutput
                        label={strings.plannedOperationBudgetLabel}
                        value={intervention.budget}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.plannedOperationPeopleTargetedLabel}
                        value={intervention.person_targeted}
                        valueType="number"
                        strongValue
                    />
                    {showPeopleReached && (
                        <TextOutput
                            label={strings.plannedOperationPeopleReachedLabel}
                            value={intervention.person_assisted}
                            valueType="number"
                            strongValue
                        />
                    )}
                </ListView>
            )}
            empty={!hasIndicators && boxes.length === 0}
        >
            <ListView layout="block">
                {hasIndicators && (
                    <div
                        className={_cs(
                            styles.indicatorTable,
                            !isApplication && styles.withActual,
                        )}
                    >
                        <Label strong>
                            {strings.plannedOperationIndicatorsLabel}
                        </Label>
                        <Label strong>
                            {strings.plannedOperationTargetedLabel}
                        </Label>
                        {!isApplication && (
                            <Label strong>
                                {strings.plannedOperationActualsLabel}
                            </Label>
                        )}
                        {intervention.indicators?.map((indicator) => (
                            <Fragment key={indicator.id}>
                                <Label className={styles.cell}>
                                    {indicator.title}
                                </Label>
                                <NumberOutput
                                    className={styles.cell}
                                    value={indicator.target}
                                />
                                {!isApplication && (
                                    <NumberOutput
                                        className={styles.cell}
                                        value={indicator.actual}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </div>
                )}
                {boxes.length > 0 && (
                    <ListView
                        layout="grid"
                        // a lone box would otherwise keep an empty second
                        // track beside it, since the grid uses auto-fill
                        numPreferredGridColumns={boxes.length > 1 ? 2 : 1}
                        spacing="sm"
                    >
                        {boxes.map(({ key, heading, content }, index) => (
                            <Container
                                key={key}
                                className={_cs(
                                    boxes.length % 2 === 1
                                        && index === boxes.length - 1
                                        && styles.fullWidthBox,
                                )}
                                withPadding
                                withDarkBackground
                                heading={heading}
                                headingLevel={6}
                            >
                                <ClampedContent
                                    size="sm"
                                    resetKey={content}
                                >
                                    <DescriptionText>
                                        {content}
                                    </DescriptionText>
                                </ClampedContent>
                            </Container>
                        ))}
                    </ListView>
                )}
            </ListView>
        </ExpandableContainer>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        emergencyResponse,
        emergencyResponsePending,
    } = useOutletContext<EmergencyOutletContext>();
    const {
        pending: sectorsPending,
        response: sectorsResponse,
    } = useRequest({
        url: '/api/v2/primarysector',
    });

    const sectorMap = listToMap(sectorsResponse, ({ key }) => key);
    const strings = useTranslation(i18n);

    const drefStrategy = useMemo(
        () => getEmergencyDrefStrategy(emergencyResponse),
        [emergencyResponse],
    );

    const drefSummary = getDrefSummary(emergencyResponse);

    const plannedInterventions = drefStrategy?.plannedInterventions;
    const earlyActions = drefStrategy?.earlyActions;
    const needByTitle = useMemo(
        () => listToMap(drefStrategy?.needsIdentified ?? [], ({ title }) => title as string),
        [drefStrategy],
    );

    // summary_of_change belongs to the ops update, so only show it on that revision
    const opsUpdate = drefStrategy?.revisionKind === 'operational-update'
        ? emergencyResponse?.dref?.operational_update_details
        : undefined;
    const summaryOfChange = opsUpdate?.summary_of_change;
    const opsUpdateDate = formatDate(opsUpdate?.update_date);

    // An approved ops update converts the operation to a response, after which
    // the revision's interventions are the current plan. Only imminent DREFs
    // carry proposed actions, so presence alone identifies the phase.
    const showEarlyActions = !drefStrategy?.hasApprovedOpsUpdate
        && (earlyActions?.length ?? 0) > 0;

    // the anticipatory phase is its own layout: early actions replace the
    // strategy summary and the planned operations
    const showPlannedOperations = !showEarlyActions
        && (plannedInterventions?.length ?? 0) > 0;
    const showStrategySummary = !showEarlyActions
        && (isTruthyString(drefSummary?.operational_strategy)
            || isTruthyString(drefSummary?.people_centered_approach));

    return (
        <TabPage
            pending={sectorsPending || emergencyResponsePending}
            empty={!showEarlyActions
                && !showPlannedOperations
                && !showStrategySummary
                && !isTruthyString(summaryOfChange)}
        >
            {isTruthyString(summaryOfChange) && (
                <Container
                    heading={isTruthyString(opsUpdateDate)
                        ? resolveToString(
                            strings.summaryOfUpdatesHeading,
                            { date: opsUpdateDate },
                        )
                        : strings.summaryOfUpdatesHeadingWithoutDate}
                    withHeaderBorder
                    withBackground
                    withPadding
                >
                    <DescriptionText>
                        {summaryOfChange}
                    </DescriptionText>
                </Container>
            )}
            {showStrategySummary && (
                <ListView layout="block">
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                    >
                        {isTruthyString(drefSummary?.operational_strategy) && (
                            <Container
                                heading={strings.operationStrategyHeading}
                                headingLevel={5}
                                withHeaderBorder
                                withShadow
                                withBackground
                                withPadding
                                footer={(
                                    <DrefSummarySourceLabel
                                        source={drefSummary?.source}
                                        section={strings.operationStrategySource}
                                    />
                                )}
                            >
                                <DescriptionText>
                                    {drefSummary?.operational_strategy}
                                </DescriptionText>
                            </Container>
                        )}
                        {isTruthyString(drefSummary?.people_centered_approach) && (
                            <Container
                                heading={strings.peopleCentredApproachHeading}
                                headingLevel={5}
                                withHeaderBorder
                                withShadow
                                withBackground
                                withPadding
                                footer={(
                                    <DrefSummarySourceLabel
                                        source={drefSummary?.source}
                                        section={strings.peopleCentredApproachSource}
                                    />
                                )}
                            >
                                <DescriptionText>
                                    {drefSummary?.people_centered_approach}
                                </DescriptionText>
                            </Container>
                        )}
                    </ListView>
                    <DrefSummaryDisclaimer multiple />
                </ListView>
            )}
            {showEarlyActions && earlyActions?.map((action) => (
                <Container
                    key={action.id}
                    heading={action.proposed_type_display}
                    withHeaderBorder
                    headerActions={(
                        <ListView spacing="sm">
                            <TextOutput
                                label={strings.plannedOperationBudgetLabel}
                                value={action.total_budget}
                                valueType="number"
                                strongValue
                            />
                            {isDefined(action.total_expenditure) && (
                                <TextOutput
                                    label={strings.proposedActionExpenditureLabel}
                                    value={action.total_expenditure}
                                    valueType="number"
                                    strongValue
                                />
                            )}
                        </ListView>
                    )}
                >
                    <ListView
                        layout="block"
                        spacing="xs"
                    >
                        {action.activities?.map((activity) => (
                            <ExpandableContainer
                                key={activity.id}
                                heading={sectorMap?.[activity.sector]?.label}
                                headingLevel={6}
                                headerIcons={(
                                    <SectorIcon
                                        className={styles.sectorIcon}
                                        sectorId={activity.sector}
                                    />
                                )}
                                withPadding
                                withShadow
                                withBorder
                                withHeaderBorder
                            >
                                <Container
                                    heading={strings.proposedActionActivityHeading}
                                    headingLevel={5}
                                    withPadding
                                    withDarkBackground
                                    empty={isFalsyString(activity.activity)}
                                >
                                    <DescriptionText>
                                        {activity.activity}
                                    </DescriptionText>
                                </Container>
                            </ExpandableContainer>
                        ))}
                    </ListView>
                </Container>
            ))}
            {showPlannedOperations && (
                <Container
                    heading={strings.plannedOperationHeading}
                    className={styles.plannedOperations}
                    withHeaderBorder
                >
                    {plannedInterventions?.map((intervention) => (
                        <Intervention
                            key={intervention.id}
                            data={intervention}
                            revisionKind={drefStrategy?.revisionKind ?? 'application'}
                            needDescription={needByTitle?.[
                                NEED_TITLE_BY_INTERVENTION_TITLE[intervention.title]
                                    ?? intervention.title
                            ]?.description ?? undefined}
                        />
                    ))}
                </Container>
            )}
        </TabPage>
    );
}

Component.displayName = 'EmergencyOperationStrategy';
