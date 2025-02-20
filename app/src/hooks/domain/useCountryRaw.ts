import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import DomainContext, { type Countries } from '#contexts/domain';

type CountryFromResponse = NonNullable<Countries['results']>[number];

export type Country = CountryFromResponse;

type ListProps = {
    region?: number;
    id?: never;
    iso3?: never;
}

type PropsForId = {
    id: number;
    iso3?: never;
    region?: never;
}

type PropsForIso3 = {
    iso3: string;
    id?: never;
    region?: never;
}

function useCountryRaw(props?: ListProps): Array<Country> | undefined
function useCountryRaw(props: PropsForId): Country | undefined
function useCountryRaw(props: PropsForIso3): Country | undefined
function useCountryRaw(
    props?: ListProps | PropsForId | PropsForIso3,
): (Country | undefined | Array<Country>) {
    const { countries: countriesUnsafe, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('country');
        },
        [register],
    );

    const countries = countriesUnsafe?.results;

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return countries?.find((country) => country.id === id);
            }

            const iso3 = props?.iso3;
            if (isDefined(iso3)) {
                return countries?.find((country) => country.iso3 === iso3);
            }

            const region = props?.region;
            if (isDefined(region)) {
                return countries?.filter((country) => country.region === region);
            }

            return countries;
        },
        [countries, props?.id, props?.iso3, props?.region],
    );

    return returnValue;
}

export default useCountryRaw;
