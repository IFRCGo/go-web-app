import { isNotDefined } from '@togglecorp/fujs';

import EmergencyOverview from '#components/EmergencyOverviewTab';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import FieldReportKeyFigure from './FieldReportKeyFigure';

function FieldReportEmergency() {
    // TODO: Add field report from event API
    const fieldReportId = '123';

    const {
        response: fieldReportResponse,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    return (
        <TabPage>
            {/* TODO: Fix type by adding new API in the component  */}
            <FieldReportKeyFigure
                response={fieldReportResponse}
            />
            {/* TODO: Fix type by adding new API in the component  */}
            <EmergencyOverview
                response={fieldReportResponse}
            />
        </TabPage>
    );
}

export default FieldReportEmergency;
