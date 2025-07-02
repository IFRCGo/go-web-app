import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DomainContext from '#contexts/domain';

import {
    type Country,
    isValidCountry,
    type PartialCountry,
} from './useCountry';

export type NationalSociety = Omit<Country, 'society_name'> & {
    society_name: string;
};

function isValidNationalSociety(country: PartialCountry): country is NationalSociety {
    return (
        isValidCountry(country)
        && isTruthyString(country?.society_name)
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

function useNationalSociety(props?: ListProps): Array<NationalSociety>
function useNationalSociety(props: PropsForId): NationalSociety | undefined
function useNationalSociety(props: PropsForIso3): NationalSociety | undefined
function useNationalSociety(
    props?: ListProps | PropsForId | PropsForIso3,
): (NationalSociety | undefined | Array<NationalSociety>) {
    const { countries: countriesUnsafe, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('country');
        },
        [register],
    );

    const nationalSocieties = useMemo(
        () => (
            countriesUnsafe?.results?.filter(isValidNationalSociety) ?? []
        ),
        [countriesUnsafe],
    );

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return nationalSocieties?.find((ns) => ns.id === id);
            }

            const iso3 = props?.iso3;
            if (isDefined(iso3)) {
                return nationalSocieties?.find((ns) => ns.iso3 === iso3);
            }

            const region = props?.region;
            if (isDefined(region)) {
                return nationalSocieties?.filter((ns) => ns.region === region);
            }

            return nationalSocieties;
        },
        [nationalSocieties, props?.id, props?.iso3, props?.region],
    );

    return returnValue;
}

export default useNationalSociety;
