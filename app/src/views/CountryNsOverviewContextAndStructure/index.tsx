import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    ListView,
} from '@ifrc-go/ui';
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
import TabPage from '#components/TabPage';
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
        error: databankResponseError,
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

            setSelectedYearForIncome(new Date(sortedIncomeList[0]!).getFullYear());
        },
    });

    const countryName = countryResponse?.name ?? DEFAULT_INVALID_TEXT;

    return (
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#context-and-structure"
            pending={databankResponsePending}
            errored={isDefined(databankResponseError)}
        >
            <NationalSocietyIndicators
                databankResponse={databankResponse}
            />
            {isDefined(countryResponse) && (
                <Container
                    empty={false}
                    pending={false}
                    filtered={false}
                    errored={false}
                    heading={strings.keyLinksHeading}
                    className={styles.keyLinks}
                    withHeaderBorder
                >
                    <ListView withWrap>
                        {isTruthyString(countryResponse.fdrs) && (
                            <Link
                                href={`https://data.ifrc.org/FDRS/national-society/${countryResponse.fdrs}`}
                                external
                                withLinkIcon
                                colorVariant="primary"
                                styleVariant="filled"
                            >
                                {strings.nationalSocietyPageOnFDRS}
                            </Link>
                        )}
                        {isTruthyString(countryResponse.url_ifrc) && (
                            <Link
                                href={countryResponse.url_ifrc}
                                external
                                withLinkIcon
                                colorVariant="primary"
                                styleVariant="filled"
                            >
                                {resolveToString(
                                    strings.countryOnIFRC,
                                    { countryName },
                                )}
                            </Link>
                        )}
                        {isTruthyString(countryResponse.iso3) && (
                            <Link
                                href={`https://reliefweb.int/country/${countryResponse.iso3}`}
                                external
                                withLinkIcon
                                colorVariant="primary"
                                styleVariant="filled"
                            >
                                {resolveToString(
                                    strings.countryOnReliefWeb,
                                    { countryName },
                                )}
                            </Link>
                        )}
                        {isTruthyString(countryResponse.society_url) && (
                            <Link
                                href={countryResponse?.society_url}
                                external
                                withLinkIcon
                                colorVariant="primary"
                                styleVariant="filled"
                            >
                                {resolveToString(
                                    strings.countryRCHomepage,
                                    { countryName },
                                )}
                            </Link>
                        )}
                        {isTruthyString(countryResponse.disaster_law_url) && (
                            <Link
                                href={countryResponse.disaster_law_url}
                                external
                                withLinkIcon
                                colorVariant="primary"
                                styleVariant="filled"
                            >
                                {resolveToString(
                                    strings.countryDisasterLaw,
                                    { countryName },
                                )}
                            </Link>
                        )}
                    </ListView>
                </Container>
            )}
            <NationalSocietyLocalUnits />
            <ListView layout="grid">
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
            </ListView>
            <ListView layout="grid">
                <NationalSocietyDirectory className={styles.nsDirectory} />
                <NationalSocietyContacts className={styles.nsContacts} />
            </ListView>
            <NationalSocietyKeyDocuments />
        </TabPage>
    );
}

Component.displayName = 'CountryNsOverviewContextAndStructure';
