import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import {
    Container,
    HtmlOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { type LngLatBoundsLike } from 'mapbox-gl';

import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import AppealsTable from '#components/domain/AppealsTable';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import RegionKeyFigures from '#components/domain/RegionKeyFigures';
import TabPage from '#components/TabPage';
import { getGeoJsonBounds } from '#utils/geo';
import { type RegionOutletContext } from '#utils/outletContext';

import RecentEmergenciesTable from './RecentEmergenciesTable';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const bbox: LngLatBoundsLike | undefined = regionResponse
        ? getGeoJsonBounds(regionResponse.bbox)
        : undefined;

    const strings = useTranslation(i18n);

    return (
        <TabPage>
            <HighlightedOperations
                variant="region"
                regionId={Number(regionId)}
            />
            <ActiveOperationMap
                variant="region"
                mapTitle={strings.fullScreenHeading}
                regionId={Number(regionId)}
                bbox={bbox}
                presentationModeAdditionalBeforeContent={isDefined(regionId) && (
                    <RegionKeyFigures
                        regionResponse={regionResponse}
                        regionId={regionId}
                    />
                )}
            />
            <AppealsTable
                variant="region"
                regionId={Number(regionId)}
            />
            <AppealsOverYearsChart regionId={Number(regionId)} />
            <RecentEmergenciesTable regionId={Number(regionId)} />
            {regionResponse?.emergency_snippets?.map(
                (emergencySnippet) => (
                    <Container
                        key={emergencySnippet.id}
                        heading={emergencySnippet.title}
                        withHeaderBorder={isTruthyString(emergencySnippet.title)}
                    >
                        <HtmlOutput
                            value={emergencySnippet.snippet}
                            key={emergencySnippet.id}
                        />
                    </Container>
                ),
            )}
        </TabPage>
    );
}

Component.displayName = 'RegionOperations';
