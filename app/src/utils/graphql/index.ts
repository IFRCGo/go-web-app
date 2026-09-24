import { isTruthyString } from '@togglecorp/fujs';
import {
    cacheExchange,
    createClient,
    fetchExchange,
} from 'urql';

import { malawiRiskWatchDomain } from '#config';
import { resolveUrl } from '#utils/resolveUrl';

export { Provider as GraphqlProvider } from 'urql';

// The backend sends no CORS headers, so the dev server proxies the API
const MALAWI_DEV_PROXY_PATH = '/malawi-backend/graphql/';

// web-app-serve blanks an unset variable to "", so empty also means off
export const malawiRiskWatchGraphqlClient = isTruthyString(malawiRiskWatchDomain)
    ? createClient({
        url: import.meta.env.DEV
            ? MALAWI_DEV_PROXY_PATH
            : resolveUrl(malawiRiskWatchDomain, 'graphql/'),
        exchanges: [cacheExchange, fetchExchange],
    })
    : undefined;
