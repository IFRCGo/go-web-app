import {
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import TableActions from '#components/Table/TableActions';
import {
    STEP_OVERVIEW,
    STEP_ASSESSMENT,
    STEP_PRIORITIZATION,
    STEP_WORKPLAN,
    STEP_ACTION,
} from '#utils/per';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

export interface Props {
    phase: number | undefined;
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
    const {
        perOverviewForm: perOverviewFormRoute,
        perAssessmentForm: perAssessmentFormRoute,
        perPrioritizationForm: perPrioritizationFormRoute,
        perWorkPlanForm: perWorkPlanFormRoute,
    } = useContext(RouteContext);

    const getRouteUrl = useCallback(
        (currentPhase: number) => {
            if (currentPhase === STEP_OVERVIEW) {
                return generatePath(
                    perOverviewFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_ASSESSMENT) {
                return generatePath(
                    perAssessmentFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_PRIORITIZATION) {
                return generatePath(
                    perPrioritizationFormRoute.absolutePath,
                    { perId },
                );
            }

            if (currentPhase === STEP_WORKPLAN) {
                return generatePath(
                    perWorkPlanFormRoute.absolutePath,
                    { perId },
                );
            }

            return undefined;
        },
        [
            perOverviewFormRoute,
            perAssessmentFormRoute,
            perPrioritizationFormRoute,
            perWorkPlanFormRoute,
            perId,
        ],
    );

    return (
        <TableActions>
            {isDefined(phase) && phase <= STEP_WORKPLAN && (
                <Link
                    to={getRouteUrl(phase)}
                >
                    {resolveToString(
                        strings.tableEditLabel,
                        { phaseDisplay },
                    )}
                </Link>
            )}
            {isDefined(phase) && phase === STEP_ACTION && (
                <Link
                    variant="secondary"
                    to={generatePath(
                        perWorkPlanFormRoute.absolutePath,
                        { perId },
                    )}
                >
                    {strings.tableViewWorkPlan}
                </Link>
            )}
        </TableActions>
    );
}

export default PerTableActions;
