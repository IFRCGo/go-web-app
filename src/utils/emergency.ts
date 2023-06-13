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
    const latestFieldReport = event.field_reports.sort(
        (a, b) => (
            new Date(b.updated_at).getTime()
                - new Date(a.updated_at).getTime()
        ),
    )[0];

    return sumSafe([
        event.num_affected,
        latestFieldReport?.num_affected,
    ]);
}
