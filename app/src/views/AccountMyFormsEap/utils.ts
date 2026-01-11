import {
    type EAP_TYPE_FULL,
    type EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

type EapResponse = GoApiResponse<'/api/v2/eap-registration/'>;
export type EapListItem = NonNullable<EapResponse['results']>[number];

interface SimplifiedEapDetails {
    eapType: typeof EAP_TYPE_SIMPLIFIED;
    data: EapListItem['simplified_eap_details'][number];
}

interface FullEapDetails {
    eapType: typeof EAP_TYPE_FULL;
    data: EapListItem['full_eap_details'][number];
}

export type EapExpandedListItem = {
    label: string;
    lastUpdated?: string;
    eap: EapListItem;
    type: 'registration' | 'development' | 'validated' | 'pending-pfa' | 'approved';
    disabled?: boolean;

    // Only applicable for development type
    details: SimplifiedEapDetails | FullEapDetails | undefined;
};

export type EapExpandedItem = {
    eap: EapListItem;
    expandedItems: EapExpandedListItem[];
};
