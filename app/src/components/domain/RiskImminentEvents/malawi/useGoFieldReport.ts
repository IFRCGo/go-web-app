import { useMemo } from 'react';
import { encodeDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useCountry from '#hooks/domain/useCountry';
import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

// A report is created from the record it references, so it cannot predate
// the record. One buffer day absorbs the skew between the record's date-only
// value and created_at's UTC datetime.
const CREATED_AT_BUFFER_DAYS = 1;

// Looks up the GO field report (if any) created from a Malawi Risk Watch
// record, matched via the external_source / external_source_id values that
// the JBA/ARC prefills set on submission.
// FIXME(frozenhelium): go-api, add external_source / external_source_id
// filters to FieldReportFilter so this can be a single filtered request
// instead of fetching the country's reports and matching client-side. Until
// then created_at__gte (record date minus a buffer day) at least bounds the
// fetch — a country can have hundreds of field reports.
export default function useGoFieldReport(
    externalSource: 'JBA' | 'ARC',
    externalSourceId: string | undefined,
    // Date of the record the report would have been created from
    // (JBA forecast issue date / ARC observation date).
    recordDate: string,
) {
    const malawiCountry = useCountry({ iso3: 'MWI' });

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
        skip: isNotDefined(externalSourceId) || isNotDefined(malawiCountry?.id),
        url: '/api/v2/field-report/',
        query: {
            countries__in: malawiCountry?.id,
            created_at__gte: createdAtGte,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const fieldReport = useMemo(
        () => (isDefined(externalSourceId)
            ? response?.results?.find((report) => (
                report.external_source === externalSource
                && report.external_source_id === externalSourceId
            ))
            : undefined),
        [response, externalSource, externalSourceId],
    );

    return {
        fieldReport,
        // While the country context is still resolving the request hasn't
        // started yet (skip), but the lookup is not settled — report it as
        // pending so callers don't briefly render a definitive "not created".
        pending: pending || (
            isDefined(externalSourceId) && isNotDefined(malawiCountry?.id)
        ),
    };
}
