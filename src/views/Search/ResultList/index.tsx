import { useMemo } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';
import Link from '#components/Link';
import Container from '#components/Container';

import styles from './styles.module.css';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;
type DistrictProvinceResult = NonNullable<SearchResponse['district_province_response']>[number];

type SearchResponseKey = keyof SearchResponse;
// NOTE: We are extracting these enum keys because others are handled by ResultTable
type ResultKey = Extract<SearchResponseKey, 'regions' | 'countries' | 'district_province_response'>;

function isDistrictProvinceResult(
    result: NonNullable<SearchResponse[ResultKey]>[number],
    resultKey: ResultKey,
): result is DistrictProvinceResult {
    return isDefined(result) && resultKey === 'district_province_response';
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

    if (isNotDefined(data) || data.length === 0) {
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
                            {resultKey === 'regions' && (
                                <Link
                                    to="regionsLayout"
                                    urlParams={{
                                        regionId: result.id,
                                    }}
                                    withLinkIcon
                                >
                                    {result.name}
                                </Link>
                            )}
                            {(resultKey === 'countries' || resultKey === 'district_province_response') && (
                                <Link
                                    to="countriesLayout"
                                    urlParams={{
                                        countryId: isDistrictProvinceResult(result, resultKey)
                                            ? result.country_id
                                            : result.id,
                                    }}
                                    withLinkIcon
                                >
                                    {isDistrictProvinceResult(result, resultKey)
                                        ? result.country
                                        : result.name}
                                </Link>
                            )}
                            {isDistrictProvinceResult(result, resultKey) && result.name}
                        </div>
                    );
                },
            )}
        </Container>
    );
}

export default ResultList;
