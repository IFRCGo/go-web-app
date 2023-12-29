import { useMemo } from 'react';
import {
    Container,
    Table,
} from '@ifrc-go/ui';
import { type Column } from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import useColumns from '../useColumns';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;

type SearchResponseKey = keyof SearchResponse;
// NOTE: We are excluding these enums as they will be handled by ResultList
type ResultKey = Exclude<SearchResponseKey, 'regions' | 'countries' | 'district_province_response'>;

interface Props {
    searchResponse: SearchResponse;
    resultKey: ResultKey;
    maxItems?: number;
    heading: React.ReactNode;
    actions: React.ReactNode;
    pending: boolean;
    filtered: boolean;
}

function ResultTable(props: Props) {
    const {
        resultKey,
        searchResponse,
        maxItems,
        heading,
        actions,
        pending,
        filtered,
    } = props;

    const columnMap = useColumns(searchResponse);

    // FIXME: this is not typesafe
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
        return isDefined(map);
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
                pending={pending}
                filtered={filtered}
            />
        </Container>
    );
}

export default ResultTable;
