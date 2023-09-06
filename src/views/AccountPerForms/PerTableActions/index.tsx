import {
    useCallback,
} from 'react';
import { isDefined, listToMap } from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import TableActions from '#components/Table/TableActions';
import {
    PER_PHASE_OVERVIEW,
    PER_PHASE_ASSESSMENT,
    PER_PHASE_PRIORITIZATION,
    PER_PHASE_WORKPLAN,
    PER_PHASE_ACTION,
} from '#utils/domain/per';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type AggregatedPerProcessStatusResponse = GoApiResponse<'/api/v2/aggregated-per-process-status/'>;
type PerPhase = NonNullable<AggregatedPerProcessStatusResponse['results']>[number]['phase'];

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
    const { per_perphases } = useGlobalEnums();
    const phaseMap = listToMap(
        per_perphases,
        ({ key }) => key,
        ({ value }) => value,
    );

    const getRouteUrl = useCallback(
        (currentPhase: number) => {
            const perPhaseUrl = {
                [PER_PHASE_OVERVIEW]: 'perOverviewForm',
                [PER_PHASE_ASSESSMENT]: 'perAssessmentForm',
                [PER_PHASE_PRIORITIZATION]: 'perPrioritizationForm',
                [PER_PHASE_WORKPLAN]: 'perWorkPlanForm',
            } as const;

            if (
                currentPhase === PER_PHASE_OVERVIEW
                || currentPhase === PER_PHASE_ASSESSMENT
                || currentPhase === PER_PHASE_PRIORITIZATION
                || currentPhase === PER_PHASE_WORKPLAN
            ) {
                return perPhaseUrl[currentPhase];
            }

            return undefined;
        },
        [],
    );

    return (
        <TableActions
            extraActions={isDefined(phase) && (
                <>
                    {phase === PER_PHASE_OVERVIEW ? (
                        <DropdownMenuItem
                            type="link"
                            to="perOverviewForm"
                            urlParams={{ perId }}
                        >
                            {resolveToString(strings.tableActionEditLabel, { phaseDisplay: phaseMap?.[PER_PHASE_OVERVIEW] ?? '--' })}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            type="link"
                            to="perOverviewForm"
                            urlParams={{ perId }}
                        >
                            {resolveToString(strings.tableActionViewLabel, { phaseDisplay: phaseMap?.[PER_PHASE_OVERVIEW] ?? '--' })}
                        </DropdownMenuItem>
                    )}
                    {phase > PER_PHASE_ASSESSMENT && (
                        <DropdownMenuItem
                            type="link"
                            to="perAssessmentForm"
                            urlParams={{ perId }}
                        >
                            {resolveToString(strings.tableActionViewLabel, { phaseDisplay: phaseMap?.[PER_PHASE_ASSESSMENT] ?? '--' })}
                        </DropdownMenuItem>
                    )}
                    {phase > PER_PHASE_PRIORITIZATION && (
                        <DropdownMenuItem
                            type="link"
                            to="perPrioritizationForm"
                            urlParams={{ perId }}
                        >
                            {resolveToString(strings.tableActionEditLabel, { phaseDisplay: phaseMap?.[PER_PHASE_PRIORITIZATION] ?? '--' })}
                        </DropdownMenuItem>
                    )}
                </>
            )}
        >
            {isDefined(phase) && phase <= PER_PHASE_WORKPLAN && (
                <Link
                    to={getRouteUrl(phase)}
                    urlParams={{ perId }}
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
                    to="perWorkPlanForm"
                    urlParams={{ perId }}
                    withUnderline
                >
                    {resolveToString(strings.tableActionEditLabel, { phaseDisplay: phaseMap?.[PER_PHASE_WORKPLAN] ?? '--' })}
                </Link>
            )}
        </TableActions>
    );
}

export default PerTableActions;
