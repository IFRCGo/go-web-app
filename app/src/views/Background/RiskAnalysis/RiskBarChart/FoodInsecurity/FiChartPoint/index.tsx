import { useMemo } from 'react';
import {
    ChartPoint,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import i18n from './i18n.json';

const currentYear = new Date().getFullYear();

interface Props {
    className?: string;
    dataPoint: {
        originalData: {
            year?: number;
            month: number;
            analysis_date?: string;
            total_displacement: number;
        },
        key: number | string;
        x: number;
        y: number;
    };
}

function FiChartPoint(props: Props) {
    const {
        dataPoint: {
            x,
            y,
            originalData,
        },
        className,
    } = props;

    // FIXME: strings should be used only by the main component
    const strings = useTranslation(i18n);

    const title = useMemo(
        () => {
            const {
                year,
                month,
            } = originalData;

            if (isDefined(year)) {
                return new Date(year, month - 1, 1).toLocaleString(
                    navigator.language,
                    {
                        year: 'numeric',
                        month: 'long',
                    },
                );
            }

            const formattedMonth = new Date(currentYear, month - 1, 1).toLocaleString(
                navigator.language,
                { month: 'long' },
            );

            return `${strings.foodInsecurityChartAverage} ${formattedMonth}`;
        },
        [originalData, strings.foodInsecurityChartAverage],
    );

    return (
        <ChartPoint
            className={className}
            x={x}
            y={y}
        >
            <Tooltip
                title={title}
                description={(
                    <>
                        {isDefined(originalData.analysis_date) && (
                            <TextOutput
                                label={strings.foodInsecurityAnalysisDate}
                                value={originalData.analysis_date}
                                valueType="date"
                            />
                        )}
                        <TextOutput
                            label={strings.foodInsecurityPeopleExposed}
                            value={originalData.total_displacement}
                            valueType="number"
                            maximumFractionDigits={0}
                        />
                    </>
                )}
            />
        </ChartPoint>
    );
}

export default FiChartPoint;
