import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
    CloseLineIcon,
    SearchLineIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import Page from '#components/Page';
import useInputState from '#hooks/useInputState';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { defaultRanking } from '#utils/common';
import {
    KEY_URL_SEARCH,
    SEARCH_TEXT_LENGTH_MIN,
} from '#utils/constants';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import ResultList from './ResultList';
import ResultTable from './ResultTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;

const MAX_VIEW_PER_SECTION = 5;
type SearchResponseKeys = keyof SearchResponse;

function isListTypeResult(
    resultKey: SearchResponseKeys,
): resultKey is Extract<SearchResponseKeys, 'regions' | 'countries' | 'district_province_response'> {
    return resultKey === 'regions' || resultKey === 'countries' || resultKey === 'district_province_response';
}

const feedbackLink = 'https://forms.office.com/e/wFQsu0V7Zb';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [activeView, setActiveView] = useState<SearchResponseKeys | undefined>();

    const [urlSearchValue, setUrlSearchValue] = useUrlSearchState<string | undefined>(
        KEY_URL_SEARCH,
        (searchString) => searchString ?? undefined,
        (searchString) => searchString,
    );

    const [searchStringTemp, setSearchStringTemp] = useInputState(
        urlSearchValue,
        (newValue) => {
            setActiveView(undefined);
            return newValue;
        },
    );

    const setUrlSearchValueWithSideEffect = useCallback(
        (newSearchValue: string | undefined) => {
            setUrlSearchValue(newSearchValue);
            setActiveView(undefined);
        },
        [setUrlSearchValue],
    );

    useEffect(
        () => {
            setSearchStringTemp(urlSearchValue);
        },
        [urlSearchValue, setSearchStringTemp],
    );

    const strings = useTranslation(i18n);
    const {
        pending: searchPending,
        response: searchResponse,
    } = useRequest({
        skip: isNotDefined(urlSearchValue),
        url: '/api/v1/search/',
        query: { [KEY_URL_SEARCH]: urlSearchValue ?? '' },
        preserveResponse: true,
    });

    const headingStringMap = useMemo<Record<SearchResponseKeys, string>>(
        () => ({
            emergencies: strings.searchEmergenciesTitle,
            reports: strings.searchReportsTitle,
            projects: strings.searchProjectsTitle,
            surge_alerts: strings.searchSurgeAlertsTitle,
            surge_deployments: strings.searchSurgeDeploymentsTitle,
            rapid_response_deployments: strings.searchRapidResponseDeploymentsTitle,

            district_province_response: strings.searchProvincesTitle,
            regions: strings.searchRegionsTitle,
            countries: strings.searchCountriesTitle,
        }),
        [
            strings.searchEmergenciesTitle,
            strings.searchReportsTitle,
            strings.searchProjectsTitle,
            strings.searchSurgeAlertsTitle,
            strings.searchSurgeDeploymentsTitle,
            strings.searchRapidResponseDeploymentsTitle,
            strings.searchProvincesTitle,
            strings.searchRegionsTitle,
            strings.searchCountriesTitle,
        ],
    );

    const handleClearSearchInput = useCallback(() => {
        setSearchStringTemp(undefined);
        setUrlSearchValueWithSideEffect(undefined);
    }, [setUrlSearchValueWithSideEffect, setSearchStringTemp]);

    const handleSearchInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') {
                return;
            }

            e.preventDefault();
            const searchStringSafe = searchStringTemp?.trim() ?? '';
            if (searchStringSafe.length >= SEARCH_TEXT_LENGTH_MIN) {
                setUrlSearchValueWithSideEffect(searchStringSafe);
            }
        },
        [
            searchStringTemp,
            setUrlSearchValueWithSideEffect,
        ],
    );

    const rankedSearchResponseKeys = useMemo(
        () => {
            const searchResponseKeys = Object.keys(searchResponse ?? {}) as SearchResponseKeys[];

            function getAverageScore(
                results: { score: number | null | undefined }[] | undefined | null,
            ) {
                const scoreList = results?.map((result) => result.score);
                if (isNotDefined(scoreList) || scoreList.length === 0) {
                    return 0;
                }

                const totalScore = sumSafe(scoreList) ?? 0;
                return totalScore / scoreList.length;
            }

            function compareStaticKey(a: string, b: string, direction?: number) {
                const staticKeyRanking: Record<string, number> = {
                    regions: 1,
                    countries: 2,
                    district_province_response: 3,
                };

                return compareNumber(
                    staticKeyRanking[a] ?? 4,
                    staticKeyRanking[b] ?? 4,
                    direction,
                );
            }

            searchResponseKeys.sort(
                (a, b) => {
                    const aScore = getAverageScore(searchResponse?.[a]) ?? 0;
                    const bScore = getAverageScore(searchResponse?.[b]) ?? 0;

                    const aDefaultRank = defaultRanking[a];
                    const bDefaultRank = defaultRanking[b];

                    return compareStaticKey(a, b)
                        || compareNumber(aScore, bScore, -1)
                        || compareNumber(aDefaultRank, bDefaultRank, -1);
                },
            );
            return searchResponseKeys;
        },
        [searchResponse],
    );

    const activeViewAction = useMemo(
        () => {
            if (isNotDefined(activeView)) {
                return undefined;
            }

            return (
                <Button
                    name={undefined}
                    variant="tertiary"
                    icons={(
                        <ChevronLeftLineIcon
                            className={styles.backIcon}
                        />
                    )}
                    onClick={setActiveView}
                >
                    {strings.searchGoBack}
                </Button>
            );
        },
        [activeView, strings.searchGoBack],
    );

    const trimmedSearchString = isDefined(searchStringTemp) ? searchStringTemp.trim() : '';
    const emptyText = useMemo(
        () => {
            if (trimmedSearchString.length < SEARCH_TEXT_LENGTH_MIN) {
                return strings.searchThreeCharactersRequired;
            }

            if (urlSearchValue !== trimmedSearchString) {
                return strings.searchHint;
            }

            return strings.searchResultforQuery;
        },
        [
            strings.searchThreeCharactersRequired,
            strings.searchHint,
            strings.searchResultforQuery,
            urlSearchValue,
            trimmedSearchString,
        ],
    );

    return (
        <Page
            className={styles.search}
            title={strings.searchPageTitle}
            heading={strings.searchPageSearchForKeyword}
            descriptionContainerClassName={styles.pageDescription}
            description={(
                <>
                    <div className={styles.searchInputContainer}>
                        <TextInput
                            name="search"
                            className={styles.searchInput}
                            variant="general"
                            hint={strings.searchHint}
                            icons={<SearchLineIcon />}
                            actions={searchStringTemp && (
                                <Button
                                    name={undefined}
                                    variant="tertiary"
                                    onClick={handleClearSearchInput}
                                >
                                    <CloseLineIcon className={styles.closeIcon} />
                                </Button>
                            )}
                            value={searchStringTemp}
                            onChange={setSearchStringTemp}
                            placeholder={strings.searchEnterAtLeastThreeCharacters}
                            onKeyDown={handleSearchInputKeyDown}
                            autoFocus
                        />
                        <Button
                            name={trimmedSearchString}
                            onClick={setUrlSearchValueWithSideEffect}
                            disabled={trimmedSearchString.length < SEARCH_TEXT_LENGTH_MIN}
                            spacing="comfortable"
                        >
                            {strings.searchGoButtonLabel}
                        </Button>
                    </div>
                    <div className={styles.feedback}>
                        <div className={styles.text}>
                            {strings.searchPageFeedbackLinkText}
                        </div>
                        <Link
                            href={feedbackLink}
                            external
                            variant="secondary"
                        >
                            {strings.searchPageFeedbackButton}
                        </Link>
                    </div>
                </>
            )}
        >
            {searchPending && <BlockLoading />}
            {!searchPending && !searchResponse && (
                <Container childrenContainerClassName={styles.emptySearchContent}>
                    <SearchLineIcon className={styles.icon} />
                    <div>
                        {emptyText}
                    </div>
                </Container>
            )}
            {!searchPending && searchResponse && activeView && !isListTypeResult(activeView) && (
                <ResultTable
                    searchResponse={searchResponse}
                    resultKey={activeView}
                    heading={headingStringMap[activeView]}
                    actions={activeViewAction}
                    pending={false}
                    filtered={false}
                />
            )}
            {!searchPending && searchResponse && activeView && isListTypeResult(activeView) && (
                <ResultList
                    searchResponse={searchResponse}
                    resultKey={activeView}
                    heading={headingStringMap[activeView]}
                    actions={activeViewAction}
                />
            )}
            {!searchPending && searchResponse && isNotDefined(activeView) && (
                <div className={styles.content}>
                    {rankedSearchResponseKeys.map((searchResponseKey) => {
                        // const RenderComponent = componentMap[searchResponseKey];
                        const data = searchResponse?.[searchResponseKey];

                        if (isNotDefined(data) || data.length === 0) {
                            return null;
                        }

                        const heading = headingStringMap[searchResponseKey];
                        const action = data.length > MAX_VIEW_PER_SECTION ? (
                            <Button
                                name={searchResponseKey}
                                variant="tertiary"
                                actions={(
                                    <ChevronRightLineIcon
                                        className={styles.forwardIcon}
                                    />
                                )}
                                onClick={setActiveView}
                            >
                                {resolveToString(
                                    strings.searchViewAll,
                                    {
                                        searchCategory: heading,
                                        numResults: data.length,
                                    },
                                )}
                            </Button>
                        ) : undefined;

                        if (isListTypeResult(searchResponseKey)) {
                            return (
                                <ResultList
                                    key={searchResponseKey}
                                    searchResponse={searchResponse}
                                    resultKey={searchResponseKey}
                                    maxItems={MAX_VIEW_PER_SECTION}
                                    heading={heading}
                                    actions={action}
                                />
                            );
                        }

                        return (
                            <ResultTable
                                key={searchResponseKey}
                                searchResponse={searchResponse}
                                resultKey={searchResponseKey}
                                maxItems={MAX_VIEW_PER_SECTION}
                                heading={heading}
                                actions={action}
                                pending={false}
                                filtered={false}
                            />
                        );
                    })}
                </div>
            )}
        </Page>
    );
}

Component.displayName = 'Search';
