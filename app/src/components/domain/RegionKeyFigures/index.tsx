import {
    AppealsIcon,
    AppealsTwoIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    InfoPopup,
    KeyFigureView,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import type { GoApiResponse } from '#utils/restRequest';
import { useGoRequest } from '#utils/restRequest';

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
    } = useGoRequest({
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
            <KeyFigureView
                icon={<DrefIcon />}
                value={aggregatedAppealResponse.active_drefs}
                valueType="number"
                info={(
                    <InfoPopup
                        title={strings.regionKeyFiguresDrefTitle}
                        description={strings.regionKeyFiguresDrefDescription}
                    />
                )}
                label={strings.regionKeyFiguresActiveDrefs}
                size="lg"
            />
            <KeyFigureView
                icon={<AppealsIcon />}
                value={aggregatedAppealResponse.active_appeals}
                valueType="number"
                info={(
                    <InfoPopup
                        title={strings.regionKeyFiguresActiveAppealsTitle}
                        description={strings.regionKeyFigureActiveAppealDescription}
                    />
                )}
                label={strings.regionKeyFiguresActiveAppeals}
                size="lg"
            />
            <KeyFigureView
                icon={<FundingIcon />}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                valueType="number"
                size="lg"
                valueOptions={{ compact: true }}
                label={strings.regionKeyFiguresBudget}
            />
            <KeyFigureView
                icon={<FundingCoverageIcon />}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded_dref_included,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                valueType="number"
                valueOptions={{
                    compact: true,
                    suffix: '%',
                }}
                size="lg"
                label={strings.regionKeyFiguresAppealsFunding}
            />
            <KeyFigureView
                icon={<TargetedPopulationIcon />}
                value={aggregatedAppealResponse.target_population}
                valueType="number"
                size="lg"
                valueOptions={{ compact: true }}
                label={strings.regionKeyFiguresTargetPop}
            />
            <KeyFigureView
                icon={<AppealsTwoIcon />}
                value={regionResponse.country_plan_count}
                valueType="number"
                size="lg"
                valueOptions={{ compact: true }}
                label={strings.regionKeyFiguresCountryPlan}
            />
        </ListView>
    );
}

export default RegionKeyFigures;
