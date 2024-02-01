import { useMemo } from 'react';
import {
    BarChart,
    Container,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    numericValueSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    selectedYear: number;
    countryId: number;
    // databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIncomeSourceBreakdown(props: Props) {
    const {
        countryId,
        selectedYear,
    } = props;

    const strings = useTranslation(i18n);
    const { response: countryIncomeResponse } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/country-income/',
        query: { country: countryId },
    });

    const incomeListForSelectedYear = useMemo(
        () => countryIncomeResponse?.results?.filter(
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
        [countryIncomeResponse, selectedYear],
    );

    return (
        <Container
            heading={
                resolveToString(
                    strings.incomeSourceBreakdownHeading,
                    { year: selectedYear },
                )
            }
            withHeaderBorder
        >
            {(isNotDefined(incomeListForSelectedYear)
                || incomeListForSelectedYear.length === 0) && (
                <Message description={strings.incomeSourceBreakdownNotAvailableMessage} />
            )}
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
