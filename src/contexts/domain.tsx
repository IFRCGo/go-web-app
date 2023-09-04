import { createContext } from 'react';
import { type GoApiResponse } from '#utils/restRequest';

export type CacheKey = 'country' | 'global-enums' | 'disaster-type' | 'user-me';

export type GlobalEnums = GoApiResponse<'/api/v2/global-enums/'>;
export type Countries = GoApiResponse<'/api/v2/country/'>;
export type DisasterTypes = GoApiResponse<'/api/v2/disaster_type/'>;
export type UserMe = GoApiResponse<'/api/v2/user/me/'>;

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
