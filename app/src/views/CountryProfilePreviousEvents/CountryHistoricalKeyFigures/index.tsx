import {
    AppealsIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    InfoPopup,
    KeyFigure,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
        <div className={_cs(styles.countryHistoricalKeyFigures, className)}>
            <KeyFigure
                icon={<DrefIcon />}
                className={styles.keyFigure}
                value={data.active_drefs}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresDrefTitle}
                        description={strings.keyFiguresDref}
                    />
                )}
                label={strings.countryHistoricalDREFOperations}
            />
            <KeyFigure
                icon={<AppealsIcon />}
                className={styles.keyFigure}
                value={data.active_appeals}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresEmergencyAppealTitle}
                        description={
                            strings.countryHistoricalFigureEmergencyAppealDescription
                        }
                    />
                )}
                label={strings.keyFiguresEmergencyAppeals}
            />
            <KeyFigure
                icon={<TargetedPopulationIcon />}
                className={styles.keyFigure}
                value={data.target_population}
                compactValue
                label={strings.keyFiguresTargetPopulation}
            />
            <KeyFigure
                icon={<FundingIcon />}
                className={styles.keyFigure}
                value={data.amount_requested_dref_included}
                compactValue
                label={strings.keyFiguresFundingRequirements}
            />
            <KeyFigure
                icon={<FundingCoverageIcon />}
                className={styles.keyFigure}
                value={getPercentage(
                    data.amount_funded_dref_included,
                    data.amount_requested_dref_included,
                )}
                suffix="%"
                compactValue
                label={strings.keyFiguresAppealsFundingCoverage}
            />
        </div>
    );
}

export default CountryHistoricalKeyFigures;
