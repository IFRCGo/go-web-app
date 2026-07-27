import {
    AppealsIcon,
    AppealsTwoIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    KeyFigureCard,
    ListView,
    MoreInfo,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

type RegionResponse = GoApiResponse<'/api/v2/region/{id}/'>;

interface Props {
    regionId: string;
    regionResponse: RegionResponse | undefined;
}

function RegionKeyFigures(props: Props) {
    const {
        regionId,
        regionResponse,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        skip: isNotDefined(regionId),
        url: '/api/v2/appeal/aggregated',
        query: { region: Number(regionId) },
    });

    const pending = aggregatedAppealPending;

    if (pending || !aggregatedAppealResponse || !regionResponse) {
        return null;
    }

    return (
        <ListView
            layout="grid"
            numPreferredGridColumns={6}
        >
            <KeyFigureCard
                icon={<DrefIcon />}
                value={aggregatedAppealResponse.active_drefs}
                valueType="number"
                info={(
                    <MoreInfo
                        title={strings.regionKeyFiguresDrefTitle}
                    >
                        {strings.regionKeyFiguresDrefDescription}
                    </MoreInfo>
                )}
                label={strings.regionKeyFiguresActiveDrefs}
                textSize="4xl"
            />
            <KeyFigureCard
                icon={<AppealsIcon />}
                value={aggregatedAppealResponse.active_appeals}
                valueType="number"
                info={(
                    <MoreInfo
                        title={strings.regionKeyFiguresActiveAppealsTitle}
                    >
                        {strings.regionKeyFigureActiveAppealDescription}
                    </MoreInfo>
                )}
                label={strings.regionKeyFiguresActiveAppeals}
                textSize="4xl"
            />
            <KeyFigureCard
                icon={<FundingIcon />}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                valueType="number"
                textSize="4xl"
                compact
                label={strings.regionKeyFiguresBudget}
            />
            <KeyFigureCard
                icon={<FundingCoverageIcon />}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded_dref_included,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                valueType="number"
                compact
                suffix="%"
                textSize="4xl"
                label={strings.regionKeyFiguresAppealsFunding}
            />
            <KeyFigureCard
                icon={<TargetedPopulationIcon />}
                value={aggregatedAppealResponse.target_population}
                valueType="number"
                textSize="4xl"
                compact
                label={strings.regionKeyFiguresTargetPop}
            />
            <KeyFigureCard
                icon={<AppealsTwoIcon />}
                value={regionResponse.country_plan_count}
                valueType="number"
                textSize="4xl"
                compact
                label={strings.regionKeyFiguresCountryPlan}
            />
        </ListView>
    );
}

export default RegionKeyFigures;
