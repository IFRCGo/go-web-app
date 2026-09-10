import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';
import {
    cacheExchange,
    createClient,
    fetchExchange,
    Provider as GraphqlProvider,
} from 'urql';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import { malawiRiskWatchGraphqlApi } from '#config';

import { type MalawiRiskWatchSource } from './utils';

import i18n from './i18n.json';

// Placeholder until the JBA and ARC sources are added
const noEvents: never[] = [];
function keySelector(event: never): string {
    return event;
}
function hazardTypeSelector() {
    return 'FL' as const;
}
function noFeatureSelector() {
    return undefined;
}
function noop() {}
function EmptyRenderer() {
    return null;
}

interface Props {
    source: MalawiRiskWatchSource;
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function MalawiRiskWatch(props: Props) {
    const {
        source,
        title,
        bbox,
    } = props;

    const strings = useTranslation(i18n);

    const graphqlClient = useMemo(
        () => {
            if (isNotDefined(malawiRiskWatchGraphqlApi)) {
                return undefined;
            }
            return createClient({
                url: malawiRiskWatchGraphqlApi,
                exchanges: [cacheExchange, fetchExchange],
            });
        },
        [],
    );

    if (isNotDefined(graphqlClient)) {
        return null;
    }

    return (
        <GraphqlProvider value={graphqlClient}>
            <RiskImminentEventMap
                key={source}
                events={noEvents}
                keySelector={keySelector}
                hazardTypeSelector={hazardTypeSelector}
                pointFeatureSelector={noFeatureSelector}
                footprintSelector={noFeatureSelector}
                activeEventExposure={undefined}
                activeEventExposurePending={false}
                listItemRenderer={EmptyRenderer}
                detailRenderer={EmptyRenderer}
                pending={false}
                sidePanelHeading={title}
                emptyMessage={strings.noDataMessage}
                bbox={bbox}
                onActiveEventChange={noop}
            />
        </GraphqlProvider>
    );
}

export default MalawiRiskWatch;
