import { createContext } from 'react';

import {
    type AdminAreaDrillDownHandler,
    type AdminAreaProperties,
    type AdminLevel,
    type AdminLevelDrillHandler,
    type NrwAdminAreaFeatureCollection,
    type NrwAdminLevelLabels,
    type PlaceCode,
    type PlaceCodeChangeHandler,
} from '../types';

export interface NrwAdminAreasContextProps {
    initialAdminLevel: AdminLevel;
    adminLevel: AdminLevel;
    adminLevelLabels: NrwAdminLevelLabels | undefined;
    adminAreas: NrwAdminAreaFeatureCollection | undefined;
    pending: boolean;
    drillPath: AdminAreaProperties[];
    parentAdminArea: AdminAreaProperties | undefined;
    hoveredPlaceCode: PlaceCode | undefined;
    onAdminAreaHoverChange: PlaceCodeChangeHandler;
    canDrillDown: (placeCode: PlaceCode) => boolean;
    drillDown: AdminAreaDrillDownHandler;
    drillUp: () => void;
    drillUpTo: AdminLevelDrillHandler;
}

const NrwAdminAreasContext = createContext<NrwAdminAreasContextProps>({
    initialAdminLevel: 1 as AdminLevel,
    adminLevel: 1 as AdminLevel,
    adminLevelLabels: undefined,
    adminAreas: undefined,
    pending: false,
    drillPath: [],
    parentAdminArea: undefined,
    hoveredPlaceCode: undefined,
    onAdminAreaHoverChange: () => {
        // eslint-disable-next-line no-console
        console.warn('NrwAdminAreasContext::onAdminAreaHoverChange called before it was initialized');
    },
    canDrillDown: () => false,
    drillDown: () => {
        // eslint-disable-next-line no-console
        console.warn('NrwAdminAreasContext::drillDown called before it was initialized');
    },
    drillUp: () => {
        // eslint-disable-next-line no-console
        console.warn('NrwAdminAreasContext::drillUp called before it was initialized');
    },
    drillUpTo: () => {
        // eslint-disable-next-line no-console
        console.warn('NrwAdminAreasContext::drillUpTo called before it was initialized');
    },
});

export default NrwAdminAreasContext;
