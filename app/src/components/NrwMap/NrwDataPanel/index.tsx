import {
    type RefObject,
    useCallback,
} from 'react';
import { Button } from '@ifrc-go/ui';
import type MapOl from 'ol/Map';

import useAlert from '#hooks/useAlert';
import { type AdminAreaDetails } from '#utils/nrw/nrwDataFetchHelpers';
import { exportMapToPdf } from '#utils/nrw/nrwMapToPdfExporter';

import styles from './styles.module.css';

interface NrwDataPanelProps {
    selectedCountry: string;
    adminDetails: AdminAreaDetails | null;
    mapRef: RefObject<MapOl | null>;
    eventId?: number;
}

/**
 * Debug component for showing country data. *
 * This will change once we have a design. *
 * This panel will be deleted once other panels are in place *
 * The export button will be moved to a header or somewhere else *
 * @param selectedCountry - ISO_A3 code of the selected country
 * @param adminDetails - details of the selected admin area, if any
 * @returns A component that is intended to be nested within a NrwMapContainer.
 */
export default function NrwDataPanel({
    selectedCountry,
    adminDetails,
    mapRef,
    eventId,
}: NrwDataPanelProps) {
    const alert = useAlert();
    const population = adminDetails?.population ?? null;

    const handleExportMapClick = useCallback(async () => {
        if (mapRef.current) {
            const filenameParts = [selectedCountry];
            if (eventId) {
                filenameParts.push(`event_${eventId}`);
            }
            try {
                await exportMapToPdf(mapRef.current, filenameParts);
            } catch (error) {
                alert.show('Failed to export map. Please try again.', { variant: 'danger' });
                console.error('Map export error:', error);
            }
        }
    }, [mapRef, selectedCountry, eventId, alert]);

    return (
        <div className={styles.dataContainer}>
            <div className={styles.exportButtonRow}>
                <Button
                    name="export-map"
                    onClick={handleExportMapClick}
                >
                    Export
                </Button>
            </div>
            { selectedCountry ? (
                <div>
                    <p>
                        <strong>
                            wwww:
                            {selectedCountry}

                        </strong>
                    </p>
                    <p>
                        wwww: Some_more_info_here
                    </p>
                    <p>
                        <strong>Population: </strong>
                        {population !== null ? population.toLocaleString() : '---'}
                    </p>
                </div>
            )
                : (
                    <div>
                        <p><strong>wwww: ---</strong></p>
                        <p>wwww: No country selected</p>
                    </div>
                )}
        </div>
    );
}
