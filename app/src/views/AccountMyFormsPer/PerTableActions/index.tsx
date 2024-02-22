import { useCallback } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
    isNotDefined,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import { api } from '#config';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    PER_PHASE_ACTION,
    PER_PHASE_ASSESSMENT,
    PER_PHASE_OVERVIEW,
    PER_PHASE_PRIORITIZATION,
    PER_PHASE_WORKPLAN,
} from '#utils/domain/per';
import { resolveUrl } from '#utils/resolveUrl';
import { useLazyRequest, type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

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

    const {
        pending,
        trigger: triggerPerExcelExport,
    } = useLazyRequest({
        url: '/api/v2/export-per/{id}/',
        other: () => {
            return {};
        },
        pathVariables: isDefined(perId) ? {
            id: String(perId),
        } : undefined,
        onSuccess: (response) => {
            
        }
    });

    const handleExportClick = useCallback(() => {
        triggerPerExcelExport({});
    }, [triggerPerExcelExport]);

    return (
        <TableActions
            extraActions={isDefined(phase) && (
                <>
                    {phase === PER_PHASE_OVERVIEW ? (
                        <DropdownMenuItem
                            type="link"
                            to="perOverviewForm"
                            urlParams={{ perId }}
                            icons={<SearchLineIcon />}
                        >
                            {resolveToString(strings.tableActionEditLabel, { phaseDisplay: phaseMap?.[PER_PHASE_OVERVIEW] ?? '--' })}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            type="link"
                            to="perOverviewForm"
                            urlParams={{ perId }}
                            icons={<SearchLineIcon />}
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
                    <DropdownMenuItem
                        type="button"
                        name="export"
                        onClick={handleExportClick}
                    >
                        {strings.dropdownPerActionExportLabel}
                    </DropdownMenuItem>
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
