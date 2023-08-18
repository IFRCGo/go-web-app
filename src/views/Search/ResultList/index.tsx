import { useContext, useMemo, useCallback } from 'react';
import { generatePath } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';
import RouteContext from '#contexts/route';
import Link from '#components/Link';
import Container from '#components/Container';

import styles from './styles.module.css';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;
type DistrictProvinceResult = NonNullable<SearchResponse['district_province_response']>[number];

type SearchResponseKey = keyof SearchResponse;
// FIXME: add a note why we are using extract here
type ResultKey = Extract<SearchResponseKey, 'regions' | 'countries' | 'district_province_response'>;

function isDistrictProvinceResult(
    result: NonNullable<SearchResponse[ResultKey]>[number],
    resultKey: ResultKey,
): result is DistrictProvinceResult {
    return !!result && resultKey === 'district_province_response';
}

interface Props {
    searchResponse: SearchResponse;
    resultKey: ResultKey;
    maxItems?: number;
    heading: React.ReactNode;
    actions: React.ReactNode;
}

function ResultList(props: Props) {
    const {
        resultKey,
        searchResponse,
        maxItems,
        heading,
        actions,
    } = props;

    const {
        region: regionRoute,
        country: countryRoute,
    } = useContext(RouteContext);

    const data: SearchResponse[ResultKey] = searchResponse[resultKey];

    const limitedData = useMemo(
        () => {
            if (isNotDefined(data)) {
                return undefined;
            }

            if (isNotDefined(maxItems) || data.length < maxItems) {
                return data;
            }

            return data.slice(0, maxItems);
        },
        [data, maxItems],
    );

    const getTo = useCallback(
        (id: number) => {
            if (resultKey === 'regions') {
                return generatePath(regionRoute.absolutePath, { regionId: String(id) });
            }

            if (resultKey === 'countries' || resultKey === 'district_province_response') {
                return generatePath(countryRoute.absolutePath, { countryId: String(id) });
            }

            return undefined;
        },
        [resultKey, countryRoute, regionRoute],
    );

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Container
            heading={heading}
            actions={actions}
            withHeaderBorder
            className={styles.resultList}
            childrenContainerClassName={styles.content}
        >
            {limitedData?.map(
                (result) => {
                    if (isDistrictProvinceResult(result, resultKey)
                        && isNotDefined(result.country_id)
                    ) {
                        return null;
                    }

                    return (
                        <div
                            className={styles.item}
                            key={result.id}
                        >
                            <Link
                                to={
                                    getTo(
                                        isDistrictProvinceResult(result, resultKey)
                                            ? result.country_id
                                            : result.id,
                                    )
                                }
                                withUnderline
                                withForwardIcon
                            >
                                {isDistrictProvinceResult(result, resultKey)
                                    ? result.country
                                    : result.name}
                            </Link>
                            {isDistrictProvinceResult(result, resultKey) && result.name}
                        </div>
                    );
                },
            )}
        </Container>
    );
}

export default ResultList;
