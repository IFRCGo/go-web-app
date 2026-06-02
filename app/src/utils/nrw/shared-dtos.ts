/**
 * AUTO-GENERATED from api-service DTOs. Do not edit by hand.
 * Regenerate with `npm run gen:frontend` (from the IBF repo root).
 *
 * Source DTOs:
 * - services/api-service/src/events/dto/event-exposed-admin-area.dto.ts
 * - services/api-service/src/events/dto/event-response.dto.ts
 */

import type { Layer } from './shared-enums';

interface AdminAreaExposureDto {
    type: Layer;
    exposed: number;
}

export interface ExposedAdminAreaDto {
    placeCode: string;
    adminLevel: number;
    exposure: AdminAreaExposureDto[];
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
    startAt: Date;
    reachesPeakAlertClassAt: Date;
    endAt: Date;
    firstIssuedAt: Date;
    lastUpdatedAt: Date;
    isOngoing: boolean;
    exposedAdminAreas: ExposedAdminAreaDto[];
}
