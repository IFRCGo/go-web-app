import { useOutletContext } from 'react-router-dom';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import CountryPastEventsChart from '#components/domain/CountryPastEventsChart';
import CountrySeasonalCalendar from '#components/domain/CountrySeasonalCalendar';
import EmergencyLessonsLearnedFromPreviousOperations from '#components/domain/EmergencyLessonsLearnedFromPreviousOperations';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { STAGE_FIELD_REPORT } from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
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

    const country = emergencyResponse?.countries?.[0];

    return (
        <TabPage
            pending={emergencyResponsePending || databankResponsePending}
            headerAction={isDefined(countryId) ? (
                <Link
                    to="countryProfilePreviousEvents"
                    urlParams={{ countryId }}
                    withLinkIcon
                >
                    {strings.seeMoreOnCountryPageLink}
                </Link>
            ) : undefined}
        >
            {emergencyResponse?.stage !== STAGE_FIELD_REPORT
                && isDefined(emergencyResponse)
                && isDefined(emergencyResponse.dtype)
                && isDefined(country) && (
                <EmergencyLessonsLearnedFromPreviousOperations
                    disasterType={emergencyResponse.dtype}
                    country={country.id}
                />
            )}
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
