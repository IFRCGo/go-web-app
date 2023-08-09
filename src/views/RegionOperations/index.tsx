import { useParams, useOutletContext } from 'react-router-dom';
import getBbox from '@turf/bbox';

import HighlightedOperations from '#components/HighlightedOperations';
import ActiveOperationMap from '#components/ActiveOperationMap';
import Container from '#components/Container';
import HtmlOutput from '#components/HtmlOutput';
import AppealsTable from '#components/AppealsTable';
import AppealsOverYearsChart from '#components/AppealsOverYearsChart';
import type { RegionOutletContext } from '#utils/outletContext';

import RecentEmergenciesTable from './RecentEmergenciesTable';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const bbox = regionResponse ? getBbox(regionResponse.bbox) : undefined;

    return (
        <div className={styles.regionOperations}>
            <HighlightedOperations
                variant="region"
                regionId={Number(regionId)}
            />
            <ActiveOperationMap
                variant="region"
                regionId={Number(regionId)}
                bbox={bbox}
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
                        withHeaderBorder
                    >
                        <HtmlOutput
                            value={emergencySnippet.snippet}
                            key={emergencySnippet.id}
                        />
                    </Container>
                ),
            )}
        </div>
    );
}

Component.displayName = 'RegionOperations';
