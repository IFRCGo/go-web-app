import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DEFAULT_INVALID_TEXT,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import WikiLink from '#components/WikiLink';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import NationalSocietyContacts from './NationalSocietyContacts';
import NationalSocietyDirectory from './NationalSocietyDirectory';
import NationalSocietyIncomeOverTime from './NationalSocietyIncomeOverTime';
import NationalSocietyIncomeSourceBreakdown from './NationalSocietyIncomeSourceBreakdown';
import NationalSocietyIndicators from './NationalSocietyIndicators';
import NationalSocietyKeyDocuments from './NationalSocietyKeyDocuments';
import NationalSocietyLocalUnits from './NationalSocietyLocalUnits';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);
    const [selectedYearForIncome, setSelectedYearForIncome] = useState(
        () => new Date().getFullYear(),
    );

    const {
        response: databankResponse,
        pending: databankResponsePending,
    } = useRequest({
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
                (a, b) => compareNumber(a, b, -1),
            );

            setSelectedYearForIncome(new Date(sortedIncomeList[0]).getFullYear());
        },
    });

    return (
        <Container
            className={styles.countryNsOverviewContextAndStructure}
            contentViewType="vertical"
            spacing="loose"
            pending={databankResponsePending}
            actions={(
                <WikiLink
                    href="user_guide/Country_Pages#context-and-structure"
                />
            )}
        >
            <NationalSocietyIndicators
                databankResponse={databankResponse}
            />
            <NationalSocietyLocalUnits />
            <Container
                contentViewType="grid"
                numPreferredGridContentColumns={2}
                spacing="relaxed"
            >
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
            </Container>
            <div className={styles.nsDirectoryAndContacts}>
                <NationalSocietyDirectory className={styles.directory} />
                <NationalSocietyContacts className={styles.contacts} />
            </div>
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
                                { countryName: countryResponse?.name ?? DEFAULT_INVALID_TEXT },
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
                                { countryName: countryResponse?.name ?? DEFAULT_INVALID_TEXT },
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
                                { countryName: countryResponse?.name ?? DEFAULT_INVALID_TEXT },
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
                                { countryName: countryResponse?.name ?? DEFAULT_INVALID_TEXT },
                            )}
                        </Link>
                    )}
                </Container>
            )}
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewContextAndStructure';
