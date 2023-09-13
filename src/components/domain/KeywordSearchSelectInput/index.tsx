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
import { KEY_URL_SEARCH } from '#utils/constants';
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

function keySelector(d: SearchItem) {
    return d.pk;
}

const searchTypeToLabelMap: Record<SearchResponseKeys, string> = {
    countries: 'Country',
    district_province_response: 'District',
    regions: 'Region',
    surge_deployments: 'Surge Deployment',
    surge_alerts: 'Surge Alert',
    rapid_response_deployments: 'RR Deployment',
    emergencies: 'Emergency',
    projects: '3W Project',
    reports: 'Field Report',
};

function labelSelector(d: SearchItem) {
    return d.name;
}
function descriptionSelector(d: SearchItem) {
    return searchTypeToLabelMap[d.type];
}

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

    const trimmedSearchText = debouncedSearchText?.trim();

    const query: GetSearchParams | undefined = trimmedSearchText ? {
        keyword: trimmedSearchText,
    } : undefined;

    const {
        pending,
        response,
    } = useRequest({
        skip: !opened || isNotDefined(trimmedSearchText) || trimmedSearchText.length === 0,
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

        return compareNumber(indexA, indexB);
    }, [rankedSearchResponseKeys]);

    const options = useMemo(
        (): SearchItem[] => {
            if (isNotDefined(response)) {
                return [];
            }
            const {
                surge_alerts,
                surge_deployments,
                rapid_response_deployments,
                district_province_response,
                ...others
            } = response;

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
                {
                    surge_alerts,
                    surge_deployments,
                    rapid_response_deployments,
                },
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

            const districtProvinceResults = mapToList(
                {
                    district_province_response,
                },
                (value, key) => (
                    value?.map((val) => ({
                        id: val.country_id,
                        name: val.name,
                        type: key as keyof SearchResponse,
                        pk: `${val.id}-${key}`,
                        score: val.score,
                    }))
                ),
            )?.flat().filter(isDefined);

            return [
                ...(results ?? []),
                ...(surgeResults ?? []),
                ...(districtProvinceResults ?? []),
            ].sort(sortByRankedKeys);
        },
        [response, sortByRankedKeys],
    );

    const handleOptionSelect = useCallback((
        _: string | undefined,
        __: string,
        option: SearchItem | undefined,
    ) => {
        if (!option) {
            return;
        }

        const route = searchTypeToRouteMap[option.type];
        navigate(
            route.route,
            {
                params: {
                    [route.routeParams]: option.id,
                },
            },
        );
    }, [navigate]);

    const handleSearchInputEnter = useCallback(() => {
        // NOTE: We are not deliberately not using debouncedSearchText here
        const searchStringSafe = searchText?.trim() ?? '';
        if (searchStringSafe.length > 0) {
            navigate(
                'search',
                { search: `${KEY_URL_SEARCH}=${searchText}` },
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
            options={undefined}
            value={undefined}
            keySelector={keySelector}
            labelSelector={labelSelector}
            descriptionSelector={descriptionSelector}
            onSearchValueChange={setSearchText}
            searchOptions={options}
            optionsPending={pending}
            onChange={handleOptionSelect}
            totalOptionsCount={options?.length ?? 0}
            onShowDropdownChange={setOpened}
            icons={<SearchLineIcon />}
            selectedOnTop={false}
            onEnterWithoutOption={handleSearchInputEnter}
        />
    );
}

export default KeywordSearchSelectInput;
