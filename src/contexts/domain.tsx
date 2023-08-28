import { createContext } from 'react';
import { paths } from '#generated/types';

export type CacheKey = 'country' | 'global-enums' | 'disaster-type' | 'user-me';

export type GlobalEnums = paths['/api/v2/global-enums/']['get']['responses']['200']['content']['application/json'];
export type Countries = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
export type DisasterTypes = paths['/api/v2/disaster_type/']['get']['responses']['200']['content']['application/json'];
export type UserMe = paths['/api/v2/user/me/']['get']['responses']['200']['content']['application/json'];

export interface Domain {
    register: (name: CacheKey) => void;
    invalidate: (name: CacheKey) => void;

    countries?: Countries;
    countriesPending?: boolean;

    userMe?: UserMe;
    userMePending?: boolean;

    disasterTypes?: DisasterTypes;
    disasterTypesPending?: boolean;

    globalEnums?: GlobalEnums;
    globalEnumsPending?: boolean;
}

const DomainContext = createContext<Domain>({
    // eslint-disable-next-line no-console
    register: () => { console.warn('DomainContext::register called before it was initialized'); },
    // eslint-disable-next-line no-console
    invalidate: () => { console.warn('DomainContext::invalidate called before it was initialized'); },
});

export default DomainContext;
