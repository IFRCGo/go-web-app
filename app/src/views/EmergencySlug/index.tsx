import {
    Navigate,
    useParams,
} from 'react-router-dom';
import { Message } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
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
    // We can also use generatePath
    return (
        <Navigate to={`/emergencies/${emergencyResponse?.id}`} replace />
    );
}

Component.displayName = 'EmergencySlug';
