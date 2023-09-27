import { useParams, Navigate } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Message from '#components/Message';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { slug } = useParams<{ slug: string }>();
    const {
        pending,
        response: emergencyResponse,
        error,
    } = useRequest({
        skip: isNotDefined(slug),
        url: '/api/v2/event/{slug}',
        pathVariables: isDefined(slug) ? {
            slug,
        } : undefined,
    });

    if (pending) {
        return <Message title={strings.emergencySlugFetchingEvent} />;
    }

    if (error) {
        return <Message title={strings.emergencySlugEventError} />;
    }

    // FIXME: Add a wrapper around navigate
    return (
        <Navigate to={`/emergencies/${emergencyResponse?.id}`} replace />
    );
}

Component.displayName = 'EmergencySlug';
