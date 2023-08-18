import type { paths } from '#generated/types';

type EmergencyResponse = paths['/api/v2/event/{id}/']['get']['responses']['200']['content']['application/json'];
export interface EmergencyOutletContext {
    emergencyResponse: EmergencyResponse | undefined;
}

type CountryResponse = paths['/api/v2/country/{id}/']['get']['responses']['200']['content']['application/json'];
export interface CountryOutletContext {
    countryResponse: CountryResponse | undefined;
}

type RegionResponse = paths['/api/v2/region/{id}/']['get']['responses']['200']['content']['application/json'];
type RegionKeyFigureResponse = paths['/api/v2/region_key_figure/']['get']['responses']['200']['content']['application/json'];
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
