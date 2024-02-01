import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import NationalSocietyContacts from './NationalSocietyContacts';
import NationalSocietyDirectory from './NationalSocietyDirectory';
import NationalSocietyIncomeOverTime from './NationalSocietyIncomeOverTime';
import NationalSocietyIncomeSourceBreakdown from './NationalSocietyIncomeSourceBreakdown';
import NationalSocietyIndicators from './NationalSocietyIndicators';
import NationalSocietyKeyDocuments from './NationalSocietyKeyDocuments';
import NationalSocietyLocalUnitsMap from './NationalSocietyLocalUnitsMap';
import NationalSocietyDirectoryInitiatives from './NsDirectoryInitiatives';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);
    const [selectedYearForIncome, setSelectedYearForIncome] = useState(
        () => new Date().getFullYear(),
    );

    const { response: databankResponse } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/country/{id}/databank/',
        pathVariables: isDefined(countryId) ? { id: Number(countryId) } : undefined,
        onSuccess: (response) => {
            if (response && response.fdrs_annual_income
                && response.fdrs_annual_income.length === 0
            ) {
                return;
            }

            const timestampList = response.fdrs_annual_income.map(
                ({ date }) => new Date(date).getTime(),
            );

            const sortedIncomeList = timestampList.sort(
                (a, b) => compareNumber(a, b),
            );

            setSelectedYearForIncome(new Date(sortedIncomeList[0]).getFullYear());
        },
    });

    return (
        <div className={styles.countryNsOverviewContextAndStructure}>
            <NationalSocietyIndicators
                databankResponse={databankResponse}
            />
            <div className={styles.nsIncome}>
                <NationalSocietyIncomeOverTime
                    selectedYear={selectedYearForIncome}
                    setSelectedYear={setSelectedYearForIncome}
                    databankResponse={databankResponse}
                />
                {isDefined(countryId) && (
                    <NationalSocietyIncomeSourceBreakdown
                        selectedYear={selectedYearForIncome}
                        countryId={Number(countryId)}
                    />
                )}
            </div>
            <div className={styles.nationalSocietyDetail}>
                <NationalSocietyLocalUnitsMap className={styles.map} />
                <NationalSocietyDirectory className={styles.directory} />
            </div>
            <NationalSocietyDirectoryInitiatives />
            <NationalSocietyContacts />
            <NationalSocietyKeyDocuments />
            {isDefined(countryResponse) && (
                <Container
                    heading={strings.keyLinksHeading}
                    className={styles.keyLinks}
                    withHeaderBorder
                    childrenContainerClassName={styles.keyLinksContent}
                >
                    {isTruthyString(countryResponse.fdrs) && (
                        <Link
                            href={`https://data.ifrc.org/FDRS/national-society/${countryResponse.fdrs}`}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {strings.nationalSocietyPageOnFDRS}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.url_ifrc) && (
                        <Link
                            href={countryResponse.url_ifrc}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryOnIFRC,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.iso3) && (
                        <Link
                            href={`https://reliefweb.int/country/${countryResponse.iso3}`}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryOnReliefWeb,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.society_url) && (
                        <Link
                            href={countryResponse?.society_url}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryRCHomepage,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.disaster_law_url) && (
                        <Link
                            href={countryResponse.disaster_law_url}
                            external
                            withLinkIcon
                            variant="primary"
                        >
                            {resolveToString(
                                strings.countryDisasterLaw,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'CountryNsOverviewContextAndStructure';
