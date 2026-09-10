import { isTruthyString } from '@togglecorp/fujs';

import { malawiRiskWatchGraphqlApi } from '#config';

export type MalawiRiskWatchSource = 'jba' | 'arc';

const MALAWI_ISO3 = 'MWI';

export function isMalawiRiskWatchEnabled(iso3: string | undefined) {
    return isTruthyString(malawiRiskWatchGraphqlApi) && iso3 === MALAWI_ISO3;
}
