import type { paths } from '#generated/types';

type CountryResponse = paths['/api/v2/country/{id}/']['get']['responses']['200']['content']['application/json'];

export interface CountryOutletContext {
    countryResponse: CountryResponse | undefined;
}
