import { useParams } from 'react-router-dom';
import {
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import { EAP_TYPE_FULL } from '#utils/constants';
import { useRequest } from '#utils/restRequest';
import EapFullExport from '#views/EapFullExport';
import SimplifiedEapExport from '#views/SimplifiedEapExport';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const { pending: eapRegistrationPending, response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const eapType = eapRegistrationResponse?.eap_type;

    if (isNotDefined(eapRegistrationResponse)) {
        return null;
    }

    return eapType === EAP_TYPE_FULL ? (
        <EapFullExport
            eapRegistrationResponse={eapRegistrationResponse}
            eapRegistrationPending={eapRegistrationPending}
        />
    ) : (
        <SimplifiedEapExport
            eapRegistrationResponse={eapRegistrationResponse}
            eapRegistrationPending={eapRegistrationPending}
        />
    );
}

Component.displayName = 'EapExport';
