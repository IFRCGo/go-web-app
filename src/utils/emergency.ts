import { max } from '@togglecorp/fujs';
import { sumSafe } from '#utils/common';

interface Event {
    field_reports: {
        updated_at: string;
        num_affected: number | null;
    }[];
    num_affected: number | null;
}

// eslint-disable-next-line import/prefer-default-export
export function getNumAffected(event: Event) {
    const latestFieldReport = max(
        event.field_reports,
        (fieldReport) => new Date(fieldReport.updated_at).getTime(),
    );

    return sumSafe([
        event.num_affected,
        latestFieldReport?.num_affected,
    ]);
}
