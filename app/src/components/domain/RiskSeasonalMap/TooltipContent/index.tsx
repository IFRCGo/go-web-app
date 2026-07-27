import { useMemo } from 'react';
import {
    ColorPreview,
    Container,
    DataDisplay,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { formatNumber } from '@ifrc-go/ui/utils';

import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import {
    type HazardType,
    hazardTypeToColorMap,
    type RiskMetric,
} from '#utils/domain/risk';

import i18n from './i18n.json';

interface Props {
    selectedRiskMetric: RiskMetric,
    valueListByHazard: {
        value: number;
        riskCategory: number;
        hazard_type: HazardType;
        hazard_type_display: string | undefined;
    }[];
}

function TooltipContent(props: Props) {
    const {
        selectedRiskMetric,
        valueListByHazard,
    } = props;

    const strings = useTranslation(i18n);
    const riskCategoryToLabelMap: Record<number, string> = useMemo(
        () => ({
            [CATEGORY_RISK_VERY_LOW]: strings.riskCategoryVeryLow,
            [CATEGORY_RISK_LOW]: strings.riskCategoryLow,
            [CATEGORY_RISK_MEDIUM]: strings.riskCategoryMedium,
            [CATEGORY_RISK_HIGH]: strings.riskCategoryHigh,
            [CATEGORY_RISK_VERY_HIGH]: strings.riskCategoryVeryHigh,
        }),
        [
            strings.riskCategoryVeryLow,
            strings.riskCategoryLow,
            strings.riskCategoryMedium,
            strings.riskCategoryHigh,
            strings.riskCategoryVeryHigh,
        ],
    );

    const riskMetricLabelMap: Record<RiskMetric, string> = {
        riskScore: strings.riskScoreLabel,
        displacement: strings.peopleAtRiskLabel,
        exposure: strings.peopleExposedLabel,
    };

    return valueListByHazard.map(
        ({
            hazard_type_display,
            hazard_type,
            riskCategory,
            value,
        }) => (
            <Container
                key={hazard_type}
                heading={hazard_type_display}
                headingLevel={6}
                headerIcons={(
                    <ColorPreview
                        value={hazardTypeToColorMap[hazard_type]}
                    />
                )}
                spacing="sm"
            >
                <DataDisplay
                    label={strings.riskScoreLabel}
                    strongValue
                    value={riskCategoryToLabelMap[riskCategory]}
                    textSize="sm"
                />
                {selectedRiskMetric !== 'riskScore' && (
                    <DataDisplay
                        label={riskMetricLabelMap[selectedRiskMetric]}
                        strongValue
                        value={formatNumber(Math.ceil(value), { maximumFractionDigits: 0 })}
                        textSize="sm"
                    />
                )}
            </Container>
        ),
    );
}

export default TooltipContent;
