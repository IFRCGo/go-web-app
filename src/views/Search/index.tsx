import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
    compareNumber,
} from '@togglecorp/fujs';
import {
    ChevronRightLineIcon,
    ChevronLeftLineIcon,
    CloseLineIcon,
    SearchLineIcon,
    SearchEyeLineIcon,
} from '@ifrc-go/icons';

import Container from '#components/Container';
import Link from '#components/Link';
import Button from '#components/Button';
import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import TextInput from '#components/TextInput';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { resolveToString } from '#utils/translation';
import { URL_SEARCH_KEY } from '#utils/constants';
import { useRequest } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { paths } from '#generated/types';

import ResultTable from './ResultTable';
import ResultList from './ResultList';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetSearch = paths['/api/v1/search/']['get'];
// TODO missing query params
// type SearchQueryParams = GetSearch['parameters']['query'];
type SearchResponse = GetSearch['responses']['200']['content']['application/json'];

const MAX_VIEW_PER_SECTION = 5;
type SearchResponseKeys = keyof SearchResponse;

function isListTypeResult(
    resultKey: SearchResponseKeys,
): resultKey is Extract<SearchResponseKeys, 'regions' | 'countries' | 'district_province_response'> {
    return resultKey === 'regions' || resultKey === 'countries' || resultKey === 'district_province_response';
}

const defaultRanking: Record<SearchResponseKeys, number> = {
    regions: 1,
    countries: 2,
    district_province_response: 3,
    emergencies: 4,
    projects: 5,
    surge_alerts: 6,
    surge_deployments: 7,
    reports: 8,
    rapid_response_deployments: 9,
};

const feedbackLink = 'https://forms.office.com/pages/responsepage.aspx?id=5Tu1ok5zbE6rDdGE9g_ZF6J45kKES69IsSyDatuGYF1UREdHUFlUWUY1TFg4TUEzNjNINkU1QUVEMi4u';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [urlSearchValue, setUrlSearchValue] = useUrlSearchState<string | undefined>(
        URL_SEARCH_KEY,
        (searchString) => searchString ?? undefined,
        (searchString) => searchString,
    );

    const [activeView, setActiveView] = useState<SearchResponseKeys | undefined>();
    const [searchStringTemp, setSearchStringTemp] = useInputState(urlSearchValue);

    const strings = useTranslation(i18n);
    const {
        pending: searchPending,
        response: searchResponse,
    } = useRequest<SearchResponse>({
        url: 'api/v1/search/',
        query: { keyword: urlSearchValue },
        skip: isNotDefined(urlSearchValue),
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
        [strings],
    );

    const handleClearSearchInput = useCallback(() => {
        setSearchStringTemp(undefined);
        setUrlSearchValue(undefined);
    }, [setUrlSearchValue, setSearchStringTemp]);

    const handleSearchInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') {
                return;
            }

            e.preventDefault();
            const searchStringSafe = searchStringTemp?.trim() ?? '';
            if (searchStringSafe.length > 2) {
                setUrlSearchValue(searchStringSafe);
            }
        },
        [
            searchStringTemp,
            setUrlSearchValue,
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

            searchResponseKeys.sort(
                (a, b) => {
                    const aScore = getAverageScore(searchResponse?.[a]) ?? 0;
                    const bScore = getAverageScore(searchResponse?.[b]) ?? 0;

                    const aDefaultRank = defaultRanking[a];
                    const bDefaultRank = defaultRanking[b];

                    return compareNumber(aScore, bScore, -1)
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
        [activeView, strings],
    );

    return (
        <Page
            className={styles.search}
            title={strings.searchPageTitle}
            heading={strings.searchPageSearchForKeyword}
            descriptionContainerClassName={styles.pageDescription}
            description={(
                <>
                    <TextInput
                        className={styles.searchInput}
                        icons={<SearchLineIcon />}
                        variant="general"
                        actions={searchStringTemp && (
                            <Button
                                name={undefined}
                                variant="tertiary"
                                onClick={handleClearSearchInput}
                            >
                                <CloseLineIcon />
                            </Button>
                        )}
                        name="search"
                        value={searchStringTemp}
                        onChange={setSearchStringTemp}
                        placeholder={strings.searchEnterAtLeastThreeCharacters}
                        onKeyDown={handleSearchInputKeyDown}
                    />
                    <div className={styles.feedback}>
                        <div className={styles.text}>
                            {strings.searchPageFeedbackLinkText}
                        </div>
                        <Link
                            to={feedbackLink}
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
                    {isDefined(searchStringTemp) && searchStringTemp.trim().length > 2 ? (
                        <>
                            <SearchEyeLineIcon className={styles.icon} />
                            {strings.searchResultforQuery}
                        </>
                    ) : (
                        <>
                            <SearchLineIcon className={styles.icon} />
                            {strings.searchThreeCharactersRequired}
                        </>
                    )}
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
                        const action = (
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
                                    { searchTitle: heading },
                                )}
                            </Button>
                        );

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
