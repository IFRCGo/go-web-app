import type { paths } from '#generated/types';
import type { GoApiResponse } from '#utils/restRequest';

type EmergencyResponse = paths['/api/v2/event/{id}/']['get']['responses']['200']['content']['application/json'];
export interface EmergencyOutletContext {
    emergencyResponse: EmergencyResponse | undefined;
}

export type CountryResponse = GoApiResponse<'/api/v2/country/{id}/'>
export interface CountryOutletContext {
    countryResponse: CountryResponse | undefined;
}

export type RegionResponse = GoApiResponse<'/api/v2/region/{id}/'>
export type RegionKeyFigureResponse = GoApiResponse<'/api/v2/region_key_figure/'>;

export interface RegionOutletContext {
    regionResponse: RegionResponse | undefined;
    regionKeyFigureResponse: RegionKeyFigureResponse | undefined;
}

type PerProcessStatusResponse = paths['/api/v2/per-process-status/{id}/']['get']['responses']['200']['content']['application/json'];
export interface PerProcessOutletContext {
    statusResponse: PerProcessStatusResponse | undefined,
    refetchStatusResponse: () => void,
    actionDivRef: React.RefObject<HTMLDivElement>,
}
