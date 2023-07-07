import { max } from '@togglecorp/fujs';
import { sumSafe } from '#utils/common';
import { paths } from '#generated/types';

type GetEvent = paths['/api/v2/event/']['get'];
type EventResponse = GetEvent['responses']['200']['content']['application/json'];
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
