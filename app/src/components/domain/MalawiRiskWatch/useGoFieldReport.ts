import { useMemo } from 'react';
import { encodeDate } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import useCountry from '#hooks/domain/useCountry';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';

export type ExternalSource = 'JBA' | 'ARC';

// A report cannot predate its record; one day absorbs the timezone skew
const CREATED_AT_BUFFER_DAYS = 1;

export function getExternalSourceId(pcode: string, date: string) {
    return `${pcode}:${date}`;
}

// The GO API cannot filter on the external source yet, so the country's
// reports since the record date are matched client-side
function useGoFieldReport(source: ExternalSource, sourceId: string, recordDate: string) {
    const malawi = useCountry({ iso3: MALAWI_ISO3 });

    const createdAtGte = useMemo(
        () => {
            const date = new Date(recordDate);
            if (Number.isNaN(date.getTime())) {
                return undefined;
            }
            date.setDate(date.getDate() - CREATED_AT_BUFFER_DAYS);
            return encodeDate(date);
        },
        [recordDate],
    );

    const {
        response,
        pending,
    } = useRequest({
        skip: isNotDefined(malawi),
        url: '/api/v2/field-report/',
        query: {
            countries__in: malawi?.id,
            created_at__gte: createdAtGte,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const fieldReport = useMemo(
        () => response?.results?.find((report) => (
            report.external_source === source && report.external_source_id === sourceId
        )),
        [response, source, sourceId],
    );

    return {
        fieldReport,
        pending: pending || isNotDefined(malawi),
    };
}

export default useGoFieldReport;
