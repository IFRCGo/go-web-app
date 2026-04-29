import { useOutletContext } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import CountryPastEventsChart from '#components/domain/CountryPastEventsChart';
import CountrySeasonalCalendar from '#components/domain/CountrySeasonalCalendar';
import TabPage from '#components/TabPage';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        emergencyResponse,
        emergencyResponsePending,
    } = useOutletContext<EmergencyOutletContext>();

    const countryId = emergencyResponse?.countries[0]?.id;

    const {
        pending: databankResponsePending,
        response: databankResponse,
        // error: databankResponseError,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });

    return (
        <TabPage pending={emergencyResponsePending || databankResponsePending}>
            <CountryPastEventsChart
                countryId={String(countryId)}
                disasterType={emergencyResponse?.dtype}
            />
            <CountrySeasonalCalendar
                acapsEvents={databankResponse?.acaps}
            />
        </TabPage>
    );
}

Component.displayName = 'EmergencyBackground';
