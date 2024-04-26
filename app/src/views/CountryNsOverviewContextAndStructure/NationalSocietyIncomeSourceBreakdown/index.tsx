import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BarChart,
    Container,
    TextOutput,
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

import Link from '#components/Link';
import { type components } from '#generated/types';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    selectedYear: number;
    countryId: number;
}
type IncomeSource = components<'read'>['schemas']['FDRSIncome'];

function incomeSourceLabelSelector(source: IncomeSource) {
    return source.indicator_details.title;
}

function incomeSourceDescriptionSelector(source: IncomeSource) {
    return source.indicator_details.description;
}

function NationalSocietyIncomeSourceBreakdown(props: Props) {
    const {
        countryId,
        selectedYear,
    } = props;

    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const {
        response: countryIncomeResponse,
        pending: countryIncomeResponsePending,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/country-income/',
        query: { country: countryId },
    });

    const incomeListForSelectedYear = useMemo(
        () => countryIncomeResponse?.results?.filter(
            ({ date }) => new Date(date).getFullYear() === selectedYear,
        ).map(({ value, indicator_details, ...other }) => {
            if (isNotDefined(value) || value <= 0 || isNotDefined(indicator_details)) {
                return undefined;
            }

            return {
                ...other,
                indicator_details,
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
            footerActions={isDefined(countryResponse?.fdrs)
                && isDefined(countryResponse.society_name) && (
                <>
                    <TextOutput
                        label={strings.incomeSourceBreakdownSourceLabel}
                        value={(
                            <Link
                                variant="tertiary"
                                href={`https://data.ifrc.org/fdrs/national-society/${countryResponse.fdrs}`}
                                external
                                withUnderline
                            >
                                {resolveToString(
                                    strings.incomeSourceBreakdownSource,
                                    {
                                        nationalSociety: countryResponse.society_name,
                                    },
                                )}
                            </Link>
                        )}
                    />
                    <TextOutput
                        value={selectedYear}
                        strongValue
                    />
                </>
            )}
            pending={countryIncomeResponsePending}
            empty={isNotDefined(incomeListForSelectedYear)
                || incomeListForSelectedYear.length === 0}
            emptyMessage={strings.incomeSourceBreakdownNotAvailableMessage}
        >
            <BarChart
                data={incomeListForSelectedYear}
                labelSelector={incomeSourceLabelSelector}
                tooltipSelector={incomeSourceDescriptionSelector}
                valueSelector={numericValueSelector}
                keySelector={numericIdSelector}
                maxRows={incomeListForSelectedYear?.length}
                compactValue
            />
        </Container>
    );
}

export default NationalSocietyIncomeSourceBreakdown;
