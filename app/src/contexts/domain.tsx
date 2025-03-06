import { createContext } from 'react';

import { type GoApiResponse } from '#utils/restRequest';

export type CacheKey = 'country' | 'global-enums' | 'disaster-type' | 'user-me' | 'region' | 'secondary-sector' | 'per-components' | 'primary-sector';

export type GlobalEnums = Partial<GoApiResponse<'/api/v2/global-enums/'>>;
export type Countries = GoApiResponse<'/api/v2/country/'>;
export type DisasterTypes = GoApiResponse<'/api/v2/disaster_type/'>;
type UserMe = GoApiResponse<'/api/v2/user/me/'>;
export type Regions = GoApiResponse<'/api/v2/region/'>;
export type SecondarySectors = GoApiResponse<'/api/v2/secondarysector'>;
export type PrimarySectors = GoApiResponse<'/api/v2/primarysector'>;
export type PerComponents = GoApiResponse<'/api/v2/per-formcomponent/'>;

export interface Domain {
    register: (name: CacheKey) => void;
    invalidate: (name: CacheKey) => void;

    regions?: Regions;
    regionsPending?: boolean;

    countries?: Countries;
    countriesPending?: boolean;

    userMe?: UserMe;
    userMePending?: boolean;

    disasterTypes?: DisasterTypes;
    disasterTypesPending?: boolean;

    globalEnums?: GlobalEnums;
    globalEnumsPending?: boolean;

    secondarySectors?: SecondarySectors;
    secondarySectorsPending?: boolean;

    primarySectors?: PrimarySectors;
    primarySectorsPending?: boolean;

    perComponents?: PerComponents;
    perComponentsPending?: boolean;
}

const DomainContext = createContext<Domain>({
    // eslint-disable-next-line no-console
    register: () => { console.warn('DomainContext::register called before it was initialized'); },
    // eslint-disable-next-line no-console
    invalidate: () => { console.warn('DomainContext::invalidate called before it was initialized'); },
});

export default DomainContext;
