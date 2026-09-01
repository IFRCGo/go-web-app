import {
    compareString,
    isTruthyString,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

type EapDistrict = NonNullable<
    GoApiResponse<'/api/v2/full-eap/{id}/'>['districts']
>[number];

interface EapAdmin1Area {
    id: number;
    name: string;
    description?: string | null;
}

export function getEapAdmin1Areas(
    districts: EapDistrict[] | null | undefined,
): EapAdmin1Area[] {
    return districts
        ?.map((area) => ({
            id: area.district,
            name: area.district_details.name,
            description: area.description,
        }))
        .toSorted((foo, bar) => compareString(foo.name, bar.name)) ?? [];
}

interface AdminAreaName {
    name?: string | null;
}

export function getEapAdminAreaTitle(
    admin2Details: AdminAreaName[] | null | undefined,
    admin1Details: AdminAreaName[] | null | undefined,
) {
    const admin2Names = admin2Details
        ?.map(({ name }) => name)
        .filter(isTruthyString) ?? [];

    if (admin2Names.length > 0) {
        return admin2Names.join(', ');
    }

    const admin1Names = admin1Details
        ?.map(({ name }) => name)
        .filter(isTruthyString) ?? [];

    if (admin1Names.length > 0) {
        return admin1Names.join(', ');
    }

    return undefined;
}
