import {
    Container,
    ListView,
    Tooltip,
} from '@ifrc-go/ui';

import Link from '#components/Link';
import { CATEGORY_RISK_VERY_HIGH } from '#utils/constants';
import {
    type HazardType,
    hazardTypeToColorMap,
    type RiskMetric,
} from '#utils/domain/risk';

import TooltipContent from '../TooltipContent';

import styles from './styles.module.css';

const MAX_RISK_SCORE = CATEGORY_RISK_VERY_HIGH;

interface Props {
    countryId?: number;
    countryName?: string;
    hazardList: {
        value: number;
        riskCategory: number;
        hazard_type: HazardType;
        hazard_type_display: string | undefined;
    }[];
    numHazardTypes: number;
    riskMetric: RiskMetric;
}

function CountryListItem(props: Props) {
    const {
        countryId,
        countryName,
        hazardList,
        numHazardTypes,
        riskMetric,
    } = props;

    return (
        <div className={styles.countryListItem}>
            <Container
                headingLevel={6}
                heading={(
                    <Link
                        to="countryProfileSeasonalRisks"
                        urlParams={{ countryId }}
                        withLinkIcon
                    >
                        {countryName}
                    </Link>
                )}
                spacing="sm"
                withPadding
                backgroundColor="background"
                withoutSpacingOpticalCorrection
            >
                <ListView
                    spacing="none"
                    className={styles.barTrack}
                >
                    {hazardList.map(
                        ({
                            hazard_type,
                            riskCategory,
                        }) => {
                            // eslint-disable-next-line max-len
                            const percentage = (100 * riskCategory) / (MAX_RISK_SCORE * numHazardTypes);

                            if (percentage < 1) {
                                return null;
                            }

                            return (
                                <div
                                    className={styles.bar}
                                    key={hazard_type}
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: hazardTypeToColorMap[hazard_type],
                                    }}
                                />
                            );
                        },
                    )}
                </ListView>
            </Container>
            <Tooltip
                title={countryName}
                description={(
                    <TooltipContent
                        selectedRiskMetric={riskMetric}
                        valueListByHazard={hazardList}
                    />
                )}
            />
        </div>
    );
}

export default CountryListItem;
