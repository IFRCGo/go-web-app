import { createContext } from 'react';
import { paths } from '#generated/types';

export type CacheKey = 'country' | 'global-enums'

export type GlobalEnums = paths['/api/v2/global-enums/']['get']['responses']['200']['content']['application/json'];
export type Countries = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];

export interface Domain {
    register: (name: CacheKey) => void;

    countries?: Countries;
    countriesPending?: boolean;

    globalEnums?: GlobalEnums;
    globalEnumsPending?: boolean;
}

const DomainContext = createContext<Domain>({
    // eslint-disable-next-line no-console
    register: () => { console.warn('DomainContext::register called before it was initialized'); },
});

export default DomainContext;
