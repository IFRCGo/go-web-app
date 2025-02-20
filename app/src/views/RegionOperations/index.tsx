import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Container,
    HtmlOutput,
    IconButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import getBbox from '@turf/bbox';

import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import AppealsTable from '#components/domain/AppealsTable';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import RegionKeyFigures from '#components/domain/RegionKeyFigures';
import { type RegionOutletContext } from '#utils/outletContext';

import RecentEmergenciesTable from './RecentEmergenciesTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    const bbox = regionResponse ? getBbox(regionResponse.bbox) : undefined;

    const [
        presentationMode,
        setFullScreenMode,
    ] = useState(false);

    const strings = useTranslation(i18n);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, [setFullScreenMode]);

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!presentationMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (presentationMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [presentationMode]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    return (
        <div className={styles.regionOperations}>
            <HighlightedOperations
                variant="region"
                regionId={Number(regionId)}
            />
            <ActiveOperationMap
                variant="region"
                onPresentationModeButtonClick={handleFullScreenToggleClick}
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
            <div
                className={_cs(presentationMode && styles.presentationMode)}
                ref={containerRef}
            >
                {presentationMode && (
                    <Container
                        heading={strings.fullScreenHeading}
                        actions={(
                            <IconButton
                                name={undefined}
                                onClick={handleFullScreenToggleClick}
                                title={strings.regionCloseButton}
                                variant="secondary"
                                ariaLabel={strings.regionCloseButton}
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                        headerDescriptionContainerClassName={styles.keyFigureList}
                        headerDescription={isDefined(regionId) && (
                            <RegionKeyFigures
                                regionResponse={regionResponse}
                                regionId={regionId}
                            />
                        )}
                    >
                        <ActiveOperationMap
                            variant="region"
                            onPresentationModeButtonClick={handleFullScreenToggleClick}
                            regionId={Number(regionId)}
                            bbox={bbox}
                            presentationMode
                        />
                    </Container>
                )}
            </div>
        </div>
    );
}

Component.displayName = 'RegionOperations';
