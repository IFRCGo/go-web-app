import { useMemo } from 'react';
import {
    BarChart,
    Container,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    numericValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    selectedYear: number;
    databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIncomeSourceBreakdown(props: Props) {
    const {
        databankResponse,
        selectedYear,
    } = props;

    const strings = useTranslation(i18n);

    const incomeListForSelectedYear = useMemo(
        () => databankResponse?.fdrs_income.filter(
            ({ date }) => new Date(date).getFullYear() === selectedYear,
        ).map(({ value, ...other }) => {
            if (isNotDefined(value) || value <= 0) {
                return undefined;
            }

            return {
                ...other,
                value,
            };
        }).filter(isDefined),
        [databankResponse, selectedYear],
    );

    return (
        <Container
            heading={strings.incomeSourceBreakdownHeading}
            withHeaderBorder
        >
            <BarChart
                data={incomeListForSelectedYear}
                labelSelector={({ indicator_display }) => indicator_display}
                valueSelector={numericValueSelector}
                keySelector={numericIdSelector}
                maxRows={incomeListForSelectedYear?.length}
                compactValue
            />
        </Container>
    );
}

export default NationalSocietyIncomeSourceBreakdown;
