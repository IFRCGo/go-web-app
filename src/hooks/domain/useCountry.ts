import {
    isDefined,
    isNotDefined,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    useMemo,
    useContext,
    useEffect,
} from 'react';

import DomainContext, { type Countries } from '#contexts/domain';

type Country = Omit<
    NonNullable<Countries['results']>[number],
    'id' | 'iso3' | 'iso3' | 'name' | 'is_deprecated' | 'independent'
> & {
    id: number;
    iso: string;
    iso3: string;
    name: string;
    is_deprecated: false | undefined;
    independent: true;
};

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
            countriesUnsafe?.results?.map((country) => {
                if (isNotDefined(country.id)
                    || isNotDefined(country.iso)
                    || isNotDefined(country.iso3)
                    || isFalsyString(country.name)
                    || !!country.is_deprecated
                    || !country.independent
                ) {
                    return undefined;
                }

                return {
                    ...country,
                    id: country.id,
                    iso: country.iso,
                    iso3: country.iso3,
                    name: country.name,
                    is_deprecated: country.is_deprecated,
                    independent: country.independent,
                };
            }).filter(isDefined)
        ),
        [countriesUnsafe],
    );

    if (isNotDefined(props)) {
        return countries;
    }

    if (isDefined(props.id)) {
        // FIXME: Optimize
        return countries?.find((country) => country.id === props.id);
    }

    if (isDefined(props.iso3)) {
        // FIXME: Optimize
        return countries?.find((country) => country.iso3 === props.iso3);
    }

    if (isDefined(props.region)) {
        // FIXME: Optimize
        return countries?.filter((country) => country.region === props.region);
    }

    return countries;
}

export default useCountry;
