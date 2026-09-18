import { useMemo } from 'react';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { useQuery } from 'urql';

import { MAX_PAGE_LIMIT } from '#utils/constants';

import HDX_DATASETS_QUERY from './queries';

function useHdxDatasets() {
    const [result] = useQuery({
        query: HDX_DATASETS_QUERY,
        variables: { limit: MAX_PAGE_LIMIT },
    });

    const datasetByName = useMemo(
        () => listToMap(
            result.data?.hdxDatasets.results ?? [],
            (dataset) => dataset.datasetName,
            (dataset) => dataset,
        ),
        [result.data],
    );

    return {
        datasetByName,
        pending: result.fetching,
        errored: isDefined(result.error),
    };
}

export default useHdxDatasets;
