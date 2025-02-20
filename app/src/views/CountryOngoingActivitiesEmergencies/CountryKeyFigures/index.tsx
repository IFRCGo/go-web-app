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

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: {
        active_drefs: number | null;
        active_appeals: number | null;
        target_population: number | null;
        amount_requested: number | null;
        amount_requested_dref_included: number | null;
        amount_funded: number | null;
        amount_funded_dref_included: number | null;
    }
}

function CountryKeyFigures(props: Props) {
    const {
        data,
        className,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <div className={_cs(styles.countryKeyFigures, className)}>
            <KeyFigure
                icon={<DrefIcon />}
                className={styles.keyFigure}
                value={data.active_drefs}
                info={(
                    <InfoPopup
                        title={strings.countryOngoingActivitiesKeyFiguresDrefTitle}
                        description={strings.countryOngoingActivitiesKeyFiguresDref}
                    />
                )}
                label={strings.activeDrefOperationsLabel}
            />
            <KeyFigure
                icon={<AppealsIcon />}
                className={styles.keyFigure}
                value={data.active_appeals}
                info={(
                    <InfoPopup
                        title={strings.countryOngoingActivitiesKeyFiguresAppealsTitle}
                        description={
                            strings.countryOngoingActivitiesFigureAppealDescription
                        }
                    />
                )}
                label={strings.countryOngoingActivitiesKeyFiguresActiveAppeals}
            />
            <KeyFigure
                icon={<TargetedPopulationIcon />}
                className={styles.keyFigure}
                value={data.target_population}
                compactValue
                label={strings.countryOngoingActivitiesKeyFiguresTargetPop}
            />
            <KeyFigure
                icon={<FundingIcon />}
                className={styles.keyFigure}
                value={data.amount_requested_dref_included}
                compactValue
                label={strings.countryOngoingActivitiesKeyFiguresBudget}
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
                label={strings.countryOngoingActivitiesKeyFiguresAppealsFunding}
            />
        </div>
    );
}

export default CountryKeyFigures;
