import type { GoApiResponse } from '#utils/restRequest';

// FIXME: move this to context

type EmergencyResponse = GoApiResponse<'/api/v2/event/{id}/'>;

type EmergencySnippetsResponse = GoApiResponse<'/api/v2/event_snippet/'>;
type Snippets = EmergencySnippetsResponse['results'];

interface EmergencyAdditionalTabs {
    name: string;
    routeName: string;
    snippets: Snippets;
}

export interface EmergencyOutletContext {
    emergencyResponse: EmergencyResponse | undefined;
    emergencyAdditionalTabs: EmergencyAdditionalTabs[] | undefined;
}

export type CountryResponse = GoApiResponse<'/api/v2/country/{id}/'>
export interface CountryOutletContext {
    countryResponse: CountryResponse | undefined;
    countryResponsePending: boolean;
}

export type RegionResponse = GoApiResponse<'/api/v2/region/{id}/'>
export type RegionKeyFigureResponse = GoApiResponse<'/api/v2/region_key_figure/'>;

export interface RegionOutletContext {
    regionResponse: RegionResponse | undefined;
    regionKeyFigureResponse: RegionKeyFigureResponse | undefined;
}

type PerProcessStatusResponse = GoApiResponse<'/api/v2/per-process-status/{id}/'>;
export interface PerProcessOutletContext {
    statusResponse: PerProcessStatusResponse | undefined,
    refetchStatusResponse: () => void,
    actionDivRef: React.RefObject<HTMLDivElement>,
}
