import { useMemo } from 'react';
import {
    Navigate,
    useParams,
} from 'react-router-dom';
import { Message } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { emergencyId } = useParams<{ emergencyId: string }>();

    const body = useMemo(() => ([{
        type: 'followedEvent',
        value: emergencyId,
    }]), [emergencyId]);

    const {
        pending,
        error,
    } = useRequest({
        skip: isNotDefined(emergencyId),
        url: '/api/v2/add_subscription/',
        method: 'POST',
        body,
    });

    if (pending) {
        return <Message title={strings.emergencyFollowFollowingEvent} />;
    }

    if (error) {
        return <Message title={strings.emergencyFollowEventError} />;
    }

    // FIXME: Add a wrapper around navigate
    return (
        <Navigate to={`/emergencies/${emergencyId}`} replace />
    );
}

Component.displayName = 'EmergencyFollow';
