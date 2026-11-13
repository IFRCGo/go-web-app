import { isNotDefined } from '@togglecorp/fujs';

import { type TransformedError } from '#utils/restRequest/go';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

// NOTE: per-map-data and per-dashboard-data are large responses built on request, so a
// dropped connection or a server error is usually temporary and worth retrying
function retryTemporaryFailure(
    result: { errored: true, value: TransformedError } | { errored: false, value: unknown },
    run: number,
): number {
    const isTemporaryFailure = result.errored && (
        isNotDefined(result.value.status) || result.value.status >= 500
    );
    return isTemporaryFailure && run <= MAX_RETRIES ? RETRY_DELAY_MS * run : -1;
}

export default retryTemporaryFailure;
