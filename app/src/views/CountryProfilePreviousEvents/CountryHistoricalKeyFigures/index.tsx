import {
    AppealsIcon,
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

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FigureData = GoApiResponse<'/api/v2/country/{id}/figure/'>;

interface Props {
    className?: string;
    data: FigureData;
}

function CountryHistoricalKeyFigures(props: Props) {
    const {
        data,
        className,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <ListView
            layout="grid"
            numPreferredGridColumns={5}
            className={className}
        >
            <KeyFigureCard
                icon={<DrefIcon />}
                value={data.active_drefs}
                valueType="number"
                info={(
                    <MoreInfo
                        title={strings.keyFiguresDrefTitle}
                    >
                        {strings.keyFiguresDref}
                    </MoreInfo>
                )}
                label={strings.countryHistoricalDREFOperations}
                boxShadow="md"
            />
            <KeyFigureCard
                icon={<AppealsIcon />}
                value={data.active_appeals}
                valueType="number"
                info={(
                    <MoreInfo
                        title={strings.keyFiguresEmergencyAppealTitle}
                    >
                        {strings.countryHistoricalFigureEmergencyAppealDescription}
                    </MoreInfo>
                )}
                label={strings.keyFiguresEmergencyAppeals}
                boxShadow="md"
            />
            <KeyFigureCard
                icon={<TargetedPopulationIcon />}
                value={data.target_population}
                valueType="number"
                compact
                label={strings.keyFiguresTargetPopulation}
                boxShadow="md"
            />
            <KeyFigureCard
                icon={<FundingIcon />}
                value={data.amount_requested_dref_included}
                valueType="number"
                compact
                label={strings.keyFiguresFundingRequirements}
                boxShadow="md"
            />
            <KeyFigureCard
                icon={<FundingCoverageIcon />}
                value={getPercentage(
                    data.amount_funded_dref_included,
                    data.amount_requested_dref_included,
                )}
                valueType="number"
                suffix="%"
                compact
                label={strings.keyFiguresAppealsFundingCoverage}
                boxShadow="md"
            />
        </ListView>
    );
}

export default CountryHistoricalKeyFigures;
