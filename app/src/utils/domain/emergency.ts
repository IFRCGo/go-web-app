import { sumSafe } from '@ifrc-go/ui/utils';
import { max } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// eslint-disable-next-line import/prefer-default-export
export function getNumAffected(event: EventListItem) {
    const latestFieldReport = max(
        event.field_reports,
        (fieldReport) => new Date(fieldReport.updated_at).getTime(),
    );

    return sumSafe([
        event.num_affected,
        latestFieldReport?.num_affected,
    ]);
}
