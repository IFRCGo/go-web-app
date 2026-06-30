/**
 * AUTO-GENERATED from api-service DTOs. Do not edit by hand.
 * Regenerate with `npm run generate:frontend` (from the IBF repo root).
 *
 * Source DTOs:
 * - services/api-service/src/events/dto/event-exposed-admin-area.dto.ts
 * - services/api-service/src/events/dto/event-response.dto.ts
 * - services/api-service/src/events/dto/layer.dto.ts
 */

import type {
    AlertClass,
    ForecastSource,
    HazardType,
    LayerName,
    LayerType,
} from './shared-enums';

export interface AdminAreaExposureDto {
    layerName: LayerName;
    total: number | null;
    exposed: number;
}

export interface ExposedAdminAreaDto {
    placeCode: string;
    adminLevel: number;
    name: string;
    exposure: AdminAreaExposureDto[];
}

export interface EventResponseDto {
    eventId: number;
    eventName: string;
    eventLabel: string;
    hazardType: HazardType;
    forecastSources: ForecastSource[];
    alertClass: AlertClass;
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
    availableLayers: LayerDto[];
}

export interface LayerDto {
    resourceId: string;
    layerName: LayerName;
    layerType: LayerType;
}
