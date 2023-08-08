import {
    useContext,
    useCallback,
    useMemo,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import TableActions from '#components/Table/TableActions';
import {
    PER_PHASE_OVERVIEW,
    PER_PHASE_ASSESSMENT,
    PER_PHASE_PRIORITIZATION,
    PER_PHASE_WORKPLAN,
    PER_PHASE_ACTION,
} from '#utils/per';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import RouteContext from '#contexts/route';
import ServerEnumsContext from '#contexts/server-enums';
import { paths } from '#generated/types';

import i18n from './i18n.json';

type AggregatedPerProcessStatusResponse = paths['/api/v2/aggregated-per-process-status/']['get']['responses']['200']['content']['application/json'];
type AggregatedPerProcessStatusItem = NonNullable<AggregatedPerProcessStatusResponse['results']>[number];
type PerPhase = AggregatedPerProcessStatusItem['phase'];

export interface Props {
    phase: PerPhase;
    phaseDisplay: string | undefined;
    perId: number;
}

function PerTableActions(props: Props) {
    const {
        perId,
        phase,
        phaseDisplay,
    } = props;

    const strings = useTranslation(i18n);
    const { per_perphases } = useContext(ServerEnumsContext);
    const {
        perOverviewForm: perOverviewFormRoute,
        perAssessmentForm: perAssessmentFormRoute,
        perPrioritizationForm: perPrioritizationFormRoute,
        perWorkPlanForm: perWorkPlanFormRoute,
    } = useContext(RouteContext);

    const perPhaseUrl = useMemo<Record<NonNullable<PerPhase>, string | undefined>>(
        () => ({
            [PER_PHASE_OVERVIEW]: generatePath(perOverviewFormRoute.absolutePath, { perId }),
            [PER_PHASE_ASSESSMENT]: generatePath(perAssessmentFormRoute.absolutePath, { perId }),
            [PER_PHASE_PRIORITIZATION]: generatePath(
                perPrioritizationFormRoute.absolutePath,
                { perId },
            ),
            [PER_PHASE_WORKPLAN]: generatePath(perWorkPlanFormRoute.absolutePath, { perId }),
            [PER_PHASE_ACTION]: undefined,
        }),
        [
            perId,
            perAssessmentFormRoute,
            perOverviewFormRoute,
            perPrioritizationFormRoute,
            perWorkPlanFormRoute,
        ],
    );

    const getRouteUrl = useCallback(
        (currentPhase: number) => {
            if (currentPhase === PER_PHASE_OVERVIEW
                || currentPhase === PER_PHASE_ASSESSMENT
                || currentPhase === PER_PHASE_PRIORITIZATION
                || currentPhase === PER_PHASE_WORKPLAN
            ) {
                return perPhaseUrl[currentPhase];
            }

            return undefined;
        },
        [perPhaseUrl],
    );

    return (
        <TableActions
            extraActions={per_perphases?.map(
                (perPhase) => (
                    perPhase.key === PER_PHASE_ACTION ? null : (
                        <DropdownMenuItem
                            key={perPhase.key}
                            type="link"
                            to={getRouteUrl(perPhase.key)}
                            disabled={perPhase.key > (phase ?? 1)}
                        >
                            {phase === perPhase.key
                                ? resolveToString(
                                    strings.tableActionEditLabel,
                                    { phaseDisplay: perPhase.value },
                                ) : resolveToString(
                                    strings.tableActionViewLabel,
                                    { phaseDisplay: perPhase.value },
                                )}
                        </DropdownMenuItem>
                    )
                ),
            )}
        >
            {isDefined(phase) && phase <= PER_PHASE_WORKPLAN && (
                <Link
                    to={getRouteUrl(phase)}
                    withUnderline
                >
                    {resolveToString(
                        strings.tableActionEditLabel,
                        { phaseDisplay },
                    )}
                </Link>
            )}
            {isDefined(phase) && phase === PER_PHASE_ACTION && (
                <Link
                    variant="secondary"
                    to={generatePath(
                        perWorkPlanFormRoute.absolutePath,
                        { perId },
                    )}
                >
                    {strings.tableActionViewWorkPlan}
                </Link>
            )}
        </TableActions>
    );
}

export default PerTableActions;
