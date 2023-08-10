import { createContext } from 'react';
import { paths } from '#generated/types';

export type CacheKey = 'country' | 'global-enums'

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
export type GlobalEnums = GetGlobalEnums['responses']['200']['content']['application/json'];

type CountriesResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
export type Country = Omit<
    NonNullable<CountriesResponse['results']>[number],
    'id' | 'iso3' | 'iso3' | 'name' | 'is_deprecated' | 'independent'
> & {
    id: number;
    iso: string;
    iso3: string;
    name: string;
    is_deprecated: false | undefined;
    independent: true;
};

export interface Domain {
    register: (name: CacheKey) => void;

    countries?: Country[];
    countriesPending?: boolean;

    globalEnums?: GlobalEnums;
    globalEnumsPending?: boolean;
}

const DomainContext = createContext<Domain>({
    // eslint-disable-next-line no-console
    register: () => { console.warn('DomainContext::register called before it was initialized'); },
});

export default DomainContext;
