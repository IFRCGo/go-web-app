import { useState, useCallback, useMemo } from 'react';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { SearchLineIcon } from '@ifrc-go/icons';
import { sumSafe } from '#utils/common';

import useRouting from '#hooks/useRouting';
import SearchSelectInput from '#components/SearchSelectInput';
import {
    useRequest,
    type GoApiUrlQuery,
    type GoApiResponse,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { KEY_URL_SEARCH, SEARCH_TEXT_LENGTH_MIN } from '#utils/constants';
import { defaultRanking } from '#views/Search';

import { type WrappedRoutes } from '../../../App/routes';

type GetSearchParams = GoApiUrlQuery<'/api/v1/search/'>;
type SearchResponse = GoApiResponse<'/api/v1/search/'>;
type SearchResponseKeys = NonNullable<keyof SearchResponse>;

type SearchItem = {
    id: number;
    name: string;
    type: SearchResponseKeys;
    score: number;
    pk: string;
}

interface Route {
    route: keyof WrappedRoutes,
    routeParams: string;
}
const keySelector = (d: SearchItem) => d.pk;
const labelSelector = (d: SearchItem) => `${d.name}`;
const searchTypeToRouteMap: Record<SearchResponseKeys, Route> = {
    regions: {
        route: 'regionsLayout',
        routeParams: 'regionId',
    },
    countries: {
        route: 'countriesLayout',
        routeParams: 'countryId',
    },
    district_province_response: {
        route: 'countriesLayout',
        routeParams: 'countryId',
    },
    emergencies: {
        route: 'emergenciesLayout',
        routeParams: 'emergencyId',
    },
    reports: {
        route: 'fieldReportDetails',
        routeParams: 'fieldReportId',
    },
    projects: {
        route: 'threeWProjectDetail',
        routeParams: 'projectId',
    },
    rapid_response_deployments: {
        route: 'emergenciesLayout',
        routeParams: 'emergencyId',
    },
    surge_alerts: {
        route: 'emergenciesLayout',
        routeParams: 'emergencyId',
    },
    surge_deployments: {
        route: 'emergenciesLayout',
        routeParams: 'emergencyId',
    },
};

function KeywordSearchSelectInput() {
    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>(undefined);
    const debouncedSearchText = useDebouncedValue(searchText);
    const { navigate } = useRouting();

    const query: GetSearchParams | undefined = debouncedSearchText ? {
        keyword: debouncedSearchText,
    } : undefined;

    const {
        pending,
        response,
    } = useRequest({
        skip: !opened || (isNotDefined(debouncedSearchText)) || (debouncedSearchText.length === 0),
        url: '/api/v1/search/',
        query,
        preserveResponse: true,
    });

    const rankedSearchResponseKeys = useMemo(
        () => {
            const searchResponseKeys = Object.keys(response ?? {}) as SearchResponseKeys[];

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
                    const aScore = getAverageScore(response?.[a]) ?? 0;
                    const bScore = getAverageScore(response?.[b]) ?? 0;

                    const aDefaultRank = defaultRanking[a];
                    const bDefaultRank = defaultRanking[b];

                    return compareStaticKey(a, b)
                        || compareNumber(aScore, bScore, -1)
                        || compareNumber(aDefaultRank, bDefaultRank, -1);
                },
            );
            return searchResponseKeys;
        },
        [response],
    );

    const sortByRankedKeys = useCallback((a: SearchItem, b: SearchItem) => {
        const indexA = rankedSearchResponseKeys.indexOf(a.type);
        const indexB = rankedSearchResponseKeys.indexOf(b.type);
        // Compare the indices to determine the sorting order
        if (indexA < indexB) {
            return -1;
        } if (indexA > indexB) {
            return 1;
        }
        return 0;
    }, [rankedSearchResponseKeys]);

    const {
        surge_alerts,
        surge_deployments,
        rapid_response_deployments,
        ...others
    } = response ?? {};

    const results = mapToList(
        (others),
        (value, key) => (
            value?.map((val) => ({
                id: val.id,
                name: val.name,
                type: key as keyof SearchResponse,
                pk: `${val.id}-${key}`,
                score: val.score,
            }))
        ),
    )?.flat().filter(isDefined);

    const surgeResults = mapToList(
        { surge_alerts, surge_deployments, rapid_response_deployments },
        (value, key) => (
            value?.map((val) => ({
                id: val.event_id,
                name: val.event_name,
                type: key as keyof SearchResponse,
                pk: `${val.id}-${key}`,
                score: val.score,
            }))
        ),
    )?.flat().filter(isDefined);

    const options: SearchItem[] = [...(results ?? []), ...(surgeResults ?? [])]
        .sort(sortByRankedKeys);

    const handleOptionSelect = useCallback((
        _: string | undefined,
        __: string,
        option: SearchItem | undefined,
    ) => {
        if (option) {
            const route = searchTypeToRouteMap[option.type];
            navigate(
                route.route,
                {
                    params: {
                        [route.routeParams]: option.id,
                    },
                },
            );
        }
    }, [navigate]);

    const handleSearchInputEnter = useCallback(() => {
        const searchStringSafe = searchText?.trim() ?? '';
        if (searchStringSafe.length >= SEARCH_TEXT_LENGTH_MIN) {
            navigate(
                'search',
                {
                    search: `${KEY_URL_SEARCH}=${searchText}`,
                },
            );
        }
    }, [
        searchText,
        navigate,
    ]);

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            name="keyword"
            options={[]}
            value={undefined}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={options}
            optionsPending={pending}
            onChange={handleOptionSelect}
            totalOptionsCount={results?.length ?? 0}
            onShowDropdownChange={setOpened}
            icons={<SearchLineIcon />}
            selectedOnTop
            onEnterWithoutOption={() => {
                handleSearchInputEnter();
            }}
        />
    );
}

export default KeywordSearchSelectInput;
