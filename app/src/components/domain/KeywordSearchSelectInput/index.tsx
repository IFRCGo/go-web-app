import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import { SearchSelectInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';

import useDebouncedValue from '#hooks/useDebouncedValue';
import useRouting from '#hooks/useRouting';
import { defaultRanking } from '#utils/common';
import { KEY_URL_SEARCH } from '#utils/constants';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import { type WrappedRoutes } from '../../../App/routes';

import i18n from './i18n.json';

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

function labelSelector(d: SearchItem) {
    return d.name;
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
    const strings = useTranslation(i18n);

    const searchTypeToLabelMap: Record<SearchResponseKeys, string> = useMemo(() => ({
        countries: strings.country,
        district_province_response: strings.district,
        regions: strings.region,
        surge_deployments: strings.surgeDeployment,
        surge_alerts: strings.surgeAlert,
        rapid_response_deployments: strings.rrDeployment,
        emergencies: strings.emergency,
        projects: strings.project,
        reports: strings.report,
    }), [
        strings.country,
        strings.district,
        strings.region,
        strings.surgeDeployment,
        strings.surgeAlert,
        strings.rrDeployment,
        strings.emergency,
        strings.project,
        strings.report,
    ]);

    const descriptionSelector = useCallback((d: SearchItem) => (
        searchTypeToLabelMap[d.type]
    ), [searchTypeToLabelMap]);

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

    const handleSearchInputEnter = useCallback((text: string | undefined) => {
        // NOTE: We are not deliberately not using debouncedSearchText here
        const searchStringSafe = text?.trim() ?? '';
        if (searchStringSafe.length > 0) {
            navigate(
                'search',
                { search: `${KEY_URL_SEARCH}=${text}` },
            );
        }
    }, [
        navigate,
    ]);

    return (
        <SearchSelectInput
            dropdownHidden={isNotDefined(searchText) || searchText.trim().length <= 0}
            name="keyword"
            options={undefined}
            value={undefined}
            placeholder={strings.search}
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
