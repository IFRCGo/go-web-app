import type { GoApiResponse } from '#utils/restRequest';

// FIXME: move this to context

type EmergencyResponse = GoApiResponse<'/api/v2/event/{id}/'>;

type EmergencySnippetsResponse = GoApiResponse<'/api/v2/event_snippet/'>;
type Snippets = EmergencySnippetsResponse['results'];

interface EmergencyAdditionalTabs {
    name: string;
    tabId: string;
    infoPageId: 1 | 2 | 3;
    routeName: string;
    snippets: Snippets;
}

type DrefApplicationResponse = GoApiResponse<'/api/v2/dref/{id}/'>
type DrefOpsUpdateResponse = GoApiResponse<'/api/v2/dref-op-update/{id}/'>
type DrefFinalReportResponse = GoApiResponse<'/api/v2/dref-final-report/{id}/'>
type ActiveDrefResponse = GoApiResponse<'/api/v2/active-dref/'>['results'][number];

export interface EmergencyOutletContext {
    emergencyResponse: EmergencyResponse | undefined;
    emergencyResponsePending: boolean;
    emergencyAdditionalTabs: EmergencyAdditionalTabs[] | undefined;
    emergencyStage: 'field-report' | 'dref' | 'emergency-appeal' | undefined;
    activeDrefOperation: ActiveDrefResponse | undefined;
    drefStage: 'application' | 'ops-update' | 'final-report' | undefined;
    drefApplication: DrefApplicationResponse | undefined;
    drefOpsUpdate: DrefOpsUpdateResponse | undefined;
    drefFinalReport: DrefFinalReportResponse | undefined;
}

export type CountryResponse = GoApiResponse<'/api/v2/country/{id}/'>
export interface CountryOutletContext {
    countryId: string | undefined;
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
    fetchingStatus: boolean,
    statusResponse: PerProcessStatusResponse | undefined,
    refetchStatusResponse: () => void,
    actionDivRef: React.RefObject<HTMLDivElement | null>,
    readOnly?: boolean;
}
