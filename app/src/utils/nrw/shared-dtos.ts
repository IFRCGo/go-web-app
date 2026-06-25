/**
 * AUTO-GENERATED from api-service DTOs. Do not edit by hand.
 * Regenerate with `npm run gen:frontend` (from the IBF repo root).
 *
 * Source DTOs:
 * - services/api-service/src/events/dto/event-exposed-admin-area.dto.ts
 * - services/api-service/src/events/dto/event-response.dto.ts
 * - services/api-service/src/events/dto/map-layer-details.dto.ts
 */

import type {
    MapLayerDisplayType,
    MapLayerInfoType,
} from './nrwMapTypes';

interface AdminAreaExposureDto {
    type: MapLayerInfoType;
    total: number | null;
    exposed: number;
}

export interface ExposedAdminAreaDto {
    placeCode: string;
    adminLevel: number;
    name: string;
    exposure: AdminAreaExposureDto[];
}

export interface MapLayerDetailsDto {
    resourceId: string;
    dataType: MapLayerInfoType;
    displayType: MapLayerDisplayType;
}

export interface EventResponseDto {
    eventId: number;
    eventName: string;
    eventLabel: string;
    hazardType: string;
    forecastSources: string[];
    alertClass: string;
    trigger: boolean;
    centroid: {
        latitude: number;
        longitude: number;
    };
    startAt: string;
    reachesPeakAlertClassAt: string;
    endAt: string;
    firstIssuedAt: string;
    lastUpdatedAt: string;
    isOngoing: boolean;
    exposedAdminAreas: ExposedAdminAreaDto[];
    availableLayers: MapLayerDetailsDto[];
}
