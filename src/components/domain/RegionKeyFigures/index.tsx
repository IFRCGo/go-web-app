import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
} from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import KeyFigure from '#components/KeyFigure';
import InfoPopup from '#components/InfoPopup';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { getPercentage } from '#utils/common';
import type { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
        <>
            <KeyFigure
                icon={<DrefIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_drefs}
                info={(
                    <InfoPopup
                        title={strings.regionKeyFiguresDrefTitle}
                        description={strings.regionKeyFiguresDrefDescription}
                    />
                )}
                label={strings.regionKeyFiguresActiveDrefs}
            />
            <KeyFigure
                icon={<AppealsIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_appeals}
                info={(
                    <InfoPopup
                        title={strings.regionKeyFiguresActiveAppealsTitle}
                        description={strings.regionKeyFigureActiveAppealDescription}
                    />
                )}
                label={strings.regionKeyFiguresActiveAppeals}
            />
            <KeyFigure
                icon={<FundingIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                compactValue
                label={strings.regionKeyFiguresBudget}
            />
            <KeyFigure
                icon={<FundingCoverageIcon />}
                className={styles.keyFigure}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                suffix="%"
                compactValue
                label={strings.regionKeyFiguresAppealsFunding}
            />
            <KeyFigure
                icon={<TargetedPopulationIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.target_population}
                compactValue
                label={strings.regionKeyFiguresTargetPop}
            />
            <KeyFigure
                icon={<AppealsTwoIcon />}
                className={styles.keyFigure}
                value={regionResponse.country_plan_count}
                compactValue
                label={strings.regionKeyFiguresCountryPlan}
            />
        </>
    );
}

export default RegionKeyFigures;
