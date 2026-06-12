import {
    cacheExchange,
    createClient,
    fetchExchange,
    Provider as UrqlProvider,
} from 'urql';

import { malawiRiskWatchGraphqlApi } from '#config';

export const malawiRiskWatchGraphqlClient = createClient({
    url: malawiRiskWatchGraphqlApi,
    exchanges: [cacheExchange, fetchExchange],
});

export { UrqlProvider };
