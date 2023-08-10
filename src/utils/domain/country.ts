import { isTruthyString } from '@togglecorp/fujs';
import { components } from '#generated/types';

type PartialCountry = components['schemas']['Country'];
type DefinedCountry = Omit<PartialCountry, 'iso' | 'name'> & {
    iso: string;
    name: string;
}
export function isValidCountry(country: PartialCountry): country is DefinedCountry {
    return isTruthyString(country.name)
        && isTruthyString(country.iso)
        && country.independent !== false
        && !country.is_deprecated;
}

type CountryWithDefinedNS = Omit<PartialCountry, 'iso' | 'name'> & {
    iso: string;
    name: string;
    society_name: string;
}
export function isValidNationalSociety(country: PartialCountry): country is CountryWithDefinedNS {
    return isValidCountry(country) && isTruthyString(country.name);
}
