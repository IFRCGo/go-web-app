import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    Label,
    ListView,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { DescriptionText } from '@ifrc-go/ui/printable';
import {
    _cs,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import {
    STAGE_DREF_APPLICATION,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedIntervention = components<'read'>['schemas']['PlannedIntervention'];

interface InterventionProps {
    data: PlannedIntervention;
    stage: number | undefined;
}

function Intervention(props: InterventionProps) {
    const {
        data: intervention,
        stage,
    } = props;

    const strings = useTranslation(i18n);

    const [showDetails, setShowDetails] = useState(false);

    return (
        <Container
            withShadow
            withBackground
            withPadding
        >
            <div
                className={_cs(
                    styles.operationRow,
                    stage === STAGE_DREF_APPLICATION && styles.applicationStage,
                )}
            >
                <ListView spacing="sm">
                    <img
                        className={styles.sectorIcon}
                        src={intervention.image_url}
                        alt={intervention.title}
                    />
                    <Label strong>
                        {intervention.title_display}
                    </Label>
                </ListView>
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
                {stage !== STAGE_DREF_APPLICATION && (
                    <TextOutput
                        label={strings.plannedOperationPeopleReachedLabel}
                        value={intervention.person_assisted}
                        valueType="number"
                        strongValue
                    />
                )}
                <Button
                    name={!showDetails}
                    styleVariant="action"
                    onClick={setShowDetails}
                >
                    {showDetails ? <ArrowUpSmallFillIcon /> : <ArrowDownSmallFillIcon /> }
                </Button>
            </div>
            {showDetails && (
                <ListView layout="block">
                    {(intervention.indicators?.length ?? 0) > 0 && (
                        <div
                            className={_cs(
                                styles.indicatorTable,
                                stage !== STAGE_DREF_APPLICATION && styles.withActual,
                            )}
                        >
                            <Label strong>
                                {strings.plannedOperationIndicatorsLabel}
                            </Label>
                            <Label strong>
                                {strings.plannedOperationTargetedLabel}
                            </Label>
                            {stage !== STAGE_DREF_APPLICATION && (
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
                                    {stage !== STAGE_DREF_APPLICATION && (
                                        <NumberOutput
                                            className={styles.cell}
                                            value={indicator.actual}
                                        />
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    )}
                    {/* FIXME(frozenhelium): go-api, the design also shows a
                        "Needs" section beside the priority actions but the
                        emergency dref payload does not expose the needs
                        identified for the operation */}
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                    >
                        {intervention.description && (
                            <Container
                                withPadding
                                withDarkBackground
                                heading={stage === STAGE_DREF_APPLICATION
                                    ? strings.plannedOperationPriorityActionsHeading
                                    : strings.plannedOperationActivitiesHeading}
                                headingLevel={6}
                            >
                                <DescriptionText>
                                    {intervention.description}
                                </DescriptionText>
                            </Container>
                        )}
                        {intervention.progress_towards_outcome && (
                            <Container
                                withPadding
                                withDarkBackground
                                heading={strings.plannedOperationProgressSoFarHeading}
                                headingLevel={6}
                            >
                                <DescriptionText>
                                    {intervention.progress_towards_outcome}
                                </DescriptionText>
                            </Container>
                        )}
                        {intervention.challenges && (
                            <Container
                                withPadding
                                withDarkBackground
                                heading={strings.plannedOperationChallengesHeading}
                                headingLevel={6}
                            >
                                <DescriptionText>
                                    {intervention.challenges}
                                </DescriptionText>
                            </Container>
                        )}
                        {intervention.narrative_description_of_achievements && (
                            <Container
                                withPadding
                                withDarkBackground
                                heading={strings.plannedOperationAchievementsHeading}
                                headingLevel={6}
                            >
                                <DescriptionText>
                                    {intervention.narrative_description_of_achievements}
                                </DescriptionText>
                            </Container>
                        )}
                    </ListView>
                </ListView>
            )}
        </Container>
    );
}

/** @knipignore */
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

    // FIXME(frozenhelium): go-api, dref on the emergency detail response can
    // be null but the schema marks it non-nullable, so the optional chaining
    // below is not enforced by the types
    const drefDetails = useMemo(() => {
        if (emergencyResponse?.stage === STAGE_FINAL_REPORT) {
            return emergencyResponse.dref?.final_report_details;
        }

        if (emergencyResponse?.stage === STAGE_OPERATIONAL_UPDATE) {
            return emergencyResponse?.dref?.operational_update_details;
        }

        return emergencyResponse?.dref;
    }, [emergencyResponse]);

    const isImminent = emergencyResponse?.dref?.type_of_dref === DREF_TYPE_IMMINENT
        && emergencyResponse?.stage === STAGE_DREF_APPLICATION;

    return (
        <TabPage
            pending={sectorsPending || emergencyResponsePending}
            empty={isImminent && isNotDefined(emergencyResponse?.dref?.proposed_action)}
        >
            {isImminent && emergencyResponse?.dref?.proposed_action?.map((action) => (
                <Container
                    key={action.id}
                    heading={action.proposed_type_display}
                    withHeaderBorder
                >
                    {action.activities?.map((activity) => (
                        <div key={activity.id}>
                            <Label strong>
                                {sectorMap?.[activity.sector]?.label}
                            </Label>
                            <Description>
                                {activity.activity}
                            </Description>
                        </div>
                    ))}
                </Container>
            ))}
            {!isImminent && (
                <Container
                    heading={strings.plannedOperationHeading}
                    className={styles.plannedOperations}
                    withHeaderBorder
                    empty={isNotDefined(drefDetails?.planned_interventions)
                        || drefDetails?.planned_interventions?.length === 0}
                >
                    {drefDetails?.planned_interventions?.map((intervention) => (
                        <Intervention
                            key={intervention.id}
                            data={intervention}
                            stage={emergencyResponse?.stage}
                        />
                    ))}
                </Container>
            )}
        </TabPage>
    );
}

Component.displayName = 'EmergencyOperationStrategy';
