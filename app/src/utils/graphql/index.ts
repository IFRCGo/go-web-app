import { isTruthyString } from '@togglecorp/fujs';
import {
    cacheExchange,
    createClient,
    fetchExchange,
} from 'urql';

import { malawiRiskWatchGraphqlApi } from '#config';

export { Provider as GraphqlProvider } from 'urql';

// web-app-serve blanks an unset variable to "", so empty also means off
export const malawiRiskWatchGraphqlClient = isTruthyString(malawiRiskWatchGraphqlApi)
    ? createClient({
        url: malawiRiskWatchGraphqlApi,
        exchanges: [cacheExchange, fetchExchange],
    })
    : undefined;
