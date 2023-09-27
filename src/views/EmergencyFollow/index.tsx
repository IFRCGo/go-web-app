import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

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
