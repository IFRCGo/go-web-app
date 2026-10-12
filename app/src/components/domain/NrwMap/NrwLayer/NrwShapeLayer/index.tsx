import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { NumberOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { getNrwExposedPopulationByPlaceCode } from '#utils/nrw/events';
import NrwEventsContext from '#views/CountryProfileNationalRiskWatch/contexts/NrwEventsContext';
import NrwAdminAreasContext from '#views/CountryProfileNationalRiskWatch/NrwAdminAreasProvider/NrwAdminAreasContext';
import { type AdminAreaProperties } from '#views/CountryProfileNationalRiskWatch/types';
import { getFeatureCollectionBounds } from '#views/CountryProfileNationalRiskWatch/utils';

import NrwMarker from '../../NrwMarker';
import { type NrwMarkerPlacement } from '../../NrwMarker/useNrwMapMarker';
import useNrwMapFitBounds from '../../useNrwMapFitBounds';
import useNrwMapLayers from '../useNrwMapLayers';
import getAdminAreaLayer from './getAdminAreaLayer';
import useAdminAreaClick from './useAdminAreaClick';
import useAdminAreaHover from './useAdminAreaHover';

import i18n from './i18n.json';
import styles from './styles.module.css';

// Show the tooltip just above-right of the pointer, as in the prototype.
const tooltipPlacement: NrwMarkerPlacement = { anchor: 'bottom-left', offset: [14, -10] };

// Drilling back up on a click beside the admin areas is disabled for now.
// Set this to true to enable it again; the Back button in the event card always drills up.
const drillUpOnOutsideClick = false;

function NrwShapeLayer(props: {
    id: string;
    isVisible: boolean;
    layerAnchorId: string; // Used to connect layer to statically ordered "anchor" layers in MapBox
}) {
    const { id, isVisible, layerAnchorId } = props;

    const { selectedEvent } = useContext(NrwEventsContext);
    const {
        adminAreas,
        pending,
        hoveredPlaceCode,
        onAdminAreaHoverChange,
        drillDown,
        drillUp,
    } = useContext(NrwAdminAreasContext);

    const strings = useTranslation(i18n);

    // Fit the map to the admin areas of the level drilled into.
    const bounds = useMemo(
        () => (isDefined(adminAreas) ? getFeatureCollectionBounds(adminAreas) : undefined),
        [adminAreas],
    );
    useNrwMapFitBounds(bounds);

    const exposedPopulationByPlaceCode = useMemo(
        () => (isDefined(selectedEvent)
            ? getNrwExposedPopulationByPlaceCode(selectedEvent)
            : new Map<string, number>()),
        [selectedEvent],
    );

    const mapLayers = useMemo(
        () => (isDefined(adminAreas) && isDefined(selectedEvent)
            ? getAdminAreaLayer(
                id,
                adminAreas,
                exposedPopulationByPlaceCode,
                selectedEvent.alertClass,
            )
            : undefined),
        [id, adminAreas, exposedPopulationByPlaceCode, selectedEvent],
    );
    useNrwMapLayers(mapLayers, isVisible, layerAnchorId);

    const isInteractive = isDefined(mapLayers) && isVisible;
    const { hoveredAdminArea, clearHover } = useAdminAreaHover(
        id,
        isInteractive,
        hoveredPlaceCode,
        onAdminAreaHoverChange,
    );

    // Drill into the clicked admin area, or (when enabled) back up on a click beside them.
    const handleClick = useCallback(
        (adminArea: AdminAreaProperties | null) => {
            if (adminArea === null) {
                if (drillUpOnOutsideClick) {
                    drillUp();
                }
                return;
            }

            clearHover();
            drillDown(adminArea);
        },
        [drillDown, drillUp, clearHover],
    );
    // The last level stays on the map while the next loads, so hold clicks until then.
    useAdminAreaClick(id, isInteractive && !pending, handleClick);

    if (isNotDefined(hoveredAdminArea) || !isVisible) {
        return null;
    }

    return (
        <NrwMarker
            coordinates={hoveredAdminArea.coordinates}
            placement={tooltipPlacement}
        >
            <div className={styles.adminAreaTooltip}>
                <div className={styles.name}>
                    {hoveredAdminArea.name}
                </div>
                <div className={styles.exposedPopulation}>
                    {strings.nrwShapeLayerExposedPopulationLabel}
                    <NumberOutput
                        value={exposedPopulationByPlaceCode.get(hoveredAdminArea.placeCode)}
                        invalidText="--"
                    />
                </div>
            </div>
        </NrwMarker>
    );
}

export default NrwShapeLayer;
