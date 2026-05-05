import { createElement } from 'react';
import {
    createRoot,
    type Root,
} from 'react-dom/client';
import type { Coordinate } from 'ol/coordinate';
import type { FeatureLike } from 'ol/Feature';
import Overlay from 'ol/Overlay';

import LocalUnitPopupContent, { type LocalUnitPopupData } from './LocalUnitPopupContent';

import styles from './styles.module.css';

export interface MapPopupPanelControls {
    overlay: Overlay;
    show: (feature: FeatureLike, coordinate: Coordinate) => void;
    hide: () => void;
}

/**
 * Creates a popup overlay for displaying point feature information.
 * May 1 2026: There is no design for this yet, so this is just a proof of concept.
 *    IFRC GO uses the <MapPopup> component, which the style on this was based on.
 *    However, <MapPopup> is highly coupled to MapBox GL, so we can't use it directly.
 *    See https://go.ifrc.org/countries/136/ns-overview/context-and-structure to see that component.
 */
export function createMapPopupPanel(): MapPopupPanelControls {
    const popupElement = document.createElement('div');
    popupElement.className = styles.popup ?? '';
    popupElement.style.display = 'none';

    let reactRoot: Root | null = null;

    const overlay = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        offset: [0, -12],
        stopEvent: true,
    });

    const hide = () => {
        popupElement.style.display = 'none';
        overlay.setPosition(undefined);
        if (reactRoot) {
            reactRoot.unmount();
            reactRoot = null;
        }
    };

    const show = (feature: FeatureLike, coordinate: Coordinate) => {
        // Extract popup data from feature properties
        const popupData: LocalUnitPopupData = {
            localBranchName: feature.get('local_branch_name')
                ?? feature.get('name')
                ?? 'Unknown location',
            englishBranchName: feature.get('english_branch_name'),
            addressLoc: feature.get('address_loc'),
            addressEn: feature.get('address_en'),
            modifiedAt: feature.get('modified_at'),
            status: feature.get('status'),
            statusDisplay: feature.get('status_display'),
            typeName: feature.get('type_name'),
            healthFacilityTypeName: feature.get('health_facility_type_name'),
            link: feature.get('link'),
        };

        // Create or reuse React root
        if (!reactRoot) {
            reactRoot = createRoot(popupElement);
        }

        reactRoot.render(
            createElement(LocalUnitPopupContent, {
                data: popupData,
                onClose: hide,
            }),
        );

        popupElement.style.display = 'block';
        overlay.setPosition(coordinate);
    };

    return { overlay, show, hide };
}
