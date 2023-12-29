import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DomainContext, { type Countries } from '#contexts/domain';

export type PartialCountry = NonNullable<Countries['results']>[number];

export type Country = Omit<
    PartialCountry,
    'id' | 'iso3' | 'iso3' | 'name' | 'is_deprecated' | 'independent'
> & {
    id: number;
    iso: string;
    iso3: string;
    name: string;
    is_deprecated: false | undefined;
    independent: true;
};

export function isValidCountry(country: PartialCountry): country is Country {
    return (
        isDefined(country.id) // NOTE: This check is added
        && isTruthyString(country.name)
        && isTruthyString(country.iso)
        && isTruthyString(country.iso3) // NOTE: This check is added
        && !!country.independent
        && !country.is_deprecated
    );
}

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

function useCountry(props?: ListProps): Array<Country>
function useCountry(props: PropsForId): Country | undefined
function useCountry(props: PropsForIso3): Country | undefined
function useCountry(
    props?: ListProps | PropsForId | PropsForIso3,
): (Country | undefined | Array<Country>) {
    const { countries: countriesUnsafe, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('country');
        },
        [register],
    );

    const countries = useMemo(
        () => (
            countriesUnsafe?.results?.filter(isValidCountry)
        ),
        [countriesUnsafe],
    );

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

export default useCountry;
