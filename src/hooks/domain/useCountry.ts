import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    useContext,
    useEffect,
} from 'react';

import DomainContext, { Country } from '#contexts/domain';

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
    const { countries, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('country');
        },
        [register],
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
