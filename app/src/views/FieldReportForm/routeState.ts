import { useLocation } from 'react-router-dom';

import { type PartialFormValue } from './common';

// Route state accepted by FieldReportForm at the new-report path
// (`/field-reports/new`). Callers pass partial form values that get spread on
// top of the form's defaults when creating a new report. Ignored on edit.
export interface FieldReportFormRouteState {
    initialValue?: PartialFormValue;
}

export function useFieldReportFormRouteState(): FieldReportFormRouteState {
    const { state } = useLocation();
    if (!state || typeof state !== 'object') {
        return {};
    }
    return state as FieldReportFormRouteState;
}
