import { createContext } from 'react';

import { paths } from '#generated/types';

type CountriesResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountriesResponse['results']>[number];

export interface CountryContextProps {
    pending: boolean;
    setPending: (pending: boolean) => void;
    countries: CountryListItem[];
    setCountries: (countries: CountryListItem[]) => void;
}

const CountryContext = createContext<CountryContextProps>({
    countries: [],
    pending: false,
    // eslint-disable-next-line no-console
    setCountries: () => { console.warn('CountryContext::setCountries called before it was initialized'); },
    // eslint-disable-next-line no-console
    setPending: () => { console.warn('CountryContext::setPending called before it was initialized'); },
});

export default CountryContext;
