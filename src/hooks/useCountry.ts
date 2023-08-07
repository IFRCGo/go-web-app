import {
    isDefined,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import { useContext, useEffect, useMemo } from 'react';

import CountryContext from '#contexts/country';
import { paths } from '#generated/types';
import { useRequest } from '#utils/restRequest';

type CountriesResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
type PartialCountry = NonNullable<CountriesResponse['results']>[number];
type Country = Omit<PartialCountry, 'iso3' | 'name'> & {
    iso3: string;
    name: string;
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
    const {
        pending,
        setPending,
        countries,
        setCountries,
    } = useContext(CountryContext);

    useRequest({
        skip: countries.length > 0 || pending,
        url: '/api/v2/country/',
        onSuccess: (response) => {
            if (response && response.results) {
                setCountries(response.results);
            }
        },
    });

    // TODO: implement this side-effect in useRequest
    useEffect(
        () => {
            if (countries.length === 0 && !pending) {
                setPending(true);

                return () => {
                    setPending(false);
                };
            }

            return undefined;
        },
        [countries, pending, setPending],
    );

    const countriesSafe = useMemo(
        () => (
            countries.map((country) => {
                if (isNotDefined(country.id)
                    || isNotDefined(country.iso)
                    || isNotDefined(country.iso3)
                    || isFalsyString(country.name)
                    || country.is_deprecated === true
                ) {
                    return undefined;
                }

                return {
                    ...country,
                    id: country.id,
                    name: country.name,
                    iso: country.iso,
                    iso3: country.iso3,
                };
            }).filter(isDefined)
        ),
        [countries],
    );

    if (isNotDefined(props)) {
        return countriesSafe;
    }

    if (isDefined(props.id)) {
        // FIXME: Optimize
        return countriesSafe.find((country) => country.id === props.id);
    }

    if (isDefined(props.iso3)) {
        // FIXME: Optimize
        return countriesSafe.find((country) => country.iso3 === props.iso3);
    }

    if (isDefined(props.region)) {
        return countriesSafe.filter((country) => country.region === props.region);
    }

    return countriesSafe;
}

export default useCountry;
