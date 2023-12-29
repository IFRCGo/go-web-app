import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type FormType } from './schema';

export type TabKeys = 'context' | 'actions' | 'focal';

export function getNextStep(current: TabKeys, direction: 1 | -1) {
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'actions',
            actions: 'focal',
        };
        return mapping[current];
    }
    const mapping: { [key in TabKeys]?: TabKeys } = {
        focal: 'actions',
        actions: 'context',
    };
    return mapping[current];
}

const fieldsInContext = [
    'country_district',
    'references',
    'hazard_type',
    'title',
    'situational_overview',
    'graphics_files',
    'map_files',
] satisfies (keyof FormType)[];

const fieldsInActions = [
    'actions_taken',
] satisfies (keyof FormType)[];

const fieldsInFocalPoints = [
    'originator_name',
    'originator_title',
    'originator_email',
    'originator_phone',
    'ifrc_name',
    'ifrc_title',
    'ifrc_email',
    'ifrc_phone',
] satisfies (keyof FormType)[];

const tabToFieldsMap = {
    context: fieldsInContext,
    actions: fieldsInActions,
    focal: fieldsInFocalPoints,
};

export function checkTabErrors(error: Error<FormType> | undefined, tabKey: TabKeys) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some(
        (field) => {
            const fieldError = fieldErrors?.[field];
            const isErrored = analyzeErrors<FormType>(fieldError);
            return isErrored;
        },
    );

    return hasErrorOnAnyField;
}
