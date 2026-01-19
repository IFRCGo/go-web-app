import {
    isNotDefined,
    isObject,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

// FIXME: imports from views should not be allowed
import { type PartialLocalUnits } from '#views/CountryNsOverviewContextAndStructure/NationalSocietyLocalUnits/LocalUnitsFormModal/schema';

import { type GoApiResponse } from './restRequest';

type LocalUnitResponse = NonNullable<GoApiResponse<'/api/v2/local-units/{id}/'>>;

export function getFormFields(value: LocalUnitResponse | PartialLocalUnits | undefined) {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created_at,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created_by_details,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_at,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_by,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_by_details,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        status,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        version_id,
        health,
        ...formValues
        // Note: the cast is safe as we're only trying to
        // remove fields if they exist
    } = removeNull(value ?? {}) as LocalUnitResponse || undefined;

    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_by_details: healthModifiedByDetails,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_at: healthModifiedAt,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modified_by: healthModifiedby,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created_at: healthCreatedAt,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created_by_details: healthCreatedByDetails,
        ...formHealthValues
    } = health ?? {};

    return { ...formValues, health: { ...formHealthValues } };
}

// FIXME: this should be gracefully handled
function isObjectWithStringKey(obj: unknown): obj is Record<string, unknown> {
    return isObject(obj);
}

export default function hasDifferences(newValue: unknown, oldValue: unknown): boolean {
    if (isNotDefined(newValue) && isNotDefined(oldValue)) {
        return false;
    }

    // FIXME: we might need to also consider the order for array
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        if (newValue.length !== oldValue.length) {
            return true;
        }

        return newValue.some(
            (_, i) => hasDifferences(newValue[i], oldValue[i]),
        );
    }

    if (isObjectWithStringKey(newValue) && isObjectWithStringKey(oldValue)) {
        const newValueKeys = Object.keys(removeNull(newValue));
        const oldValueKeys = Object.keys(removeNull(oldValue));

        if (newValueKeys.length !== oldValueKeys.length) {
            return true;
        }

        return newValueKeys.some(
            (key) => hasDifferences(newValue[key], oldValue[key]),
        );
    }

    return newValue !== oldValue;
}
