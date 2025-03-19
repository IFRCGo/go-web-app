import { useCallback } from 'react';
import {
    Container,
    Pager,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import SurgeCard from './SurgeCard';

import i18n from './i18n.json';

type AggregatedSurgeResponse = GoApiResponse<'/api/v2/aggregated-eru-and-rapid-response/'>;
type AggregatedSurgeItem = NonNullable<AggregatedSurgeResponse['results']>[number];

function aggregatedSurgeKeySelector(item: AggregatedSurgeItem) {
    return item.id;
}

const PAGE_SIZE = 6;

function ActiveSurgeSupport() {
    const strings = useTranslation(i18n);

    const {
        limit,
        offset,
        page,
        setPage,
    } = useFilterState({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const {
        pending: aggregatedSurgePending,
        response: aggregatedSurgeResponse,
        error: aggregatedSurgeResponseError,
    } = useRequest({
        url: '/api/v2/aggregated-eru-and-rapid-response/',
        query: {
            limit,
            offset,
        },
        preserveResponse: true,
    });

    const rendererParams = useCallback((id: number, surgeItem: AggregatedSurgeItem) => ({
        emergencyId: id,
        surgeItem,
    }), []);

    return (
        <Container
            heading={strings.activeSurgeSupportHeading}
            withHeaderBorder
            pending={aggregatedSurgePending}
            errored={isDefined(aggregatedSurgeResponseError)}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            spacing="comfortable"
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={aggregatedSurgeResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <RawList
                data={aggregatedSurgeResponse?.results}
                keySelector={aggregatedSurgeKeySelector}
                renderer={SurgeCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default ActiveSurgeSupport;
