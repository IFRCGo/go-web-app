import { injectClientId } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
export type ValidationOption = NonNullable<GlobalEnumsResponse['local_units_status']>[number];
export type ValidationStatusKey = ValidationOption['key'];
type RequestType = 'authenticated' | 'public';

export const VALIDATED = 1 satisfies ValidationStatusKey;
export const UNVALIDATED = 2 satisfies ValidationStatusKey;
export const PENDING_VALIDATION = 3 satisfies ValidationStatusKey;
export const EXTERNALLY_MANAGED = 4 satisfies ValidationStatusKey;

export const AUTHENTICATED = 'authenticated' satisfies RequestType;
export const PUBLIC = 'public' satisfies RequestType;

type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;

export function injectClientIdToResponse(response: LocalUnitResponse | undefined) {
    if (isNotDefined(response)) {
        return undefined;
    }

    const {
        health,
        ...otherValues
    } = response;

    const {
        other_profiles,
        ...otherHealthValues
    } = health ?? {};

    return removeNull({
        health: {
            other_profiles: other_profiles?.map(injectClientId),
            ...otherHealthValues,
        },
        ...otherValues,
    });
}
