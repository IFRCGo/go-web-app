export interface GeoFeature {
    type: string;
    coordinates: number[]
}

export const RECORD_TYPE_COUNTRY = 1;
export const RECORD_TYPE_CLUSTER = 2;
export const RECORD_TYPE_REGION = 3;

export interface Country {
    iso: string | null;
    iso3: string | null;
    society_url: string;
    region: number | null;
    key_priorities: string | null;
    inform_score: string | null
    id: number;
    url_ifrc: string;
    record_type: number;
    record_type_display: string;
    bbox: GeoFeature;
    centroid: GeoFeature | undefined;

    independent: boolean;
    is_deprecated: boolean;
    fdrs: string;
    name: string;
    overview: string | null;
    society_name: string;
}

export type CountryMini = Pick<
    Country,
    'fdrs'
        | 'id'
        | 'independent'
        | 'is_deprecated'
        | 'iso'
        | 'iso3'
        | 'name'
        | 'record_type'
        | 'record_type_display'
        | 'region'
        | 'society_name'
> & {
    average_household_size: number | null;
}

export type DistrictMini = Pick<
District,
'code'
| 'id'
| 'is_deprecated'
| 'is_enclave'
| 'name'
>

export interface District {
    code: string;
    bbox: GeoFeature;
    centroid: GeoFeature | undefined;
    id: number;
    is_deprecated: boolean;
    is_enclave: boolean;
    name: string;
}

export interface Region {
    name: number;
    id: number;
    region_name: string;
    label: string;
    bbox: GeoFeature;
}
