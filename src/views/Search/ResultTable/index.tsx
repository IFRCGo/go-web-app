import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import type { Column } from '#components/Table/types';
import Table from '#components/Table';
import Container from '#components/Container';
import { paths } from '#generated/types';

import useColumns from '../useColumns';

type GetSearch = paths['/api/v1/search/']['get'];
type SearchResponse = GetSearch['responses']['200']['content']['application/json'];

type SearchResponseKey = keyof SearchResponse;
type ResultKey = Exclude<SearchResponseKey, 'regions' | 'countries' | 'district_province_response'>;

interface Props {
    searchResponse: SearchResponse;
    resultKey: ResultKey;
    maxItems?: number;
    heading: React.ReactNode;
    actions: React.ReactNode;
}

function ResultTable(props: Props) {
    const {
        resultKey,
        searchResponse,
        maxItems,
        heading,
        actions,
    } = props;

    const columnMap = useColumns(searchResponse);

    function isValidMapping<RESULT>(map: {
        columns: unknown,
        data: unknown,
        keySelector: unknown,
    }): map is {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns: Column<RESULT, number, any, any>[],
        data: RESULT[],
        keySelector: (datum: RESULT) => number,
    } {
        return !!map;
    }

    const mappings = columnMap[resultKey];
    const limitedData = useMemo(
        () => {
            if (isNotDefined(mappings.data)) {
                return undefined;
            }

            if (isNotDefined(maxItems) || mappings.data.length < maxItems) {
                return mappings.data;
            }

            return mappings.data.slice(0, maxItems);
        },
        [mappings.data, maxItems],
    );

    if (!isValidMapping(mappings)) {
        return null;
    }

    return (
        <Container
            heading={heading}
            actions={actions}
            withHeaderBorder
        >
            <Table
                data={limitedData}
                columns={mappings.columns}
                keySelector={mappings.keySelector}
            />
        </Container>
    );
}

export default ResultTable;
