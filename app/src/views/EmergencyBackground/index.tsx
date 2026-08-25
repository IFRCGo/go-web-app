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
import {
    STAGE_DREF_APPLICATION,
    STAGE_FIELD_REPORT,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

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
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });

    const country = emergencyResponse?.countries?.[0];

    const stage = emergencyResponse?.stage;
    const isDrefStage = stage === STAGE_DREF_APPLICATION
        || stage === STAGE_OPERATIONAL_UPDATE
        || stage === STAGE_FINAL_REPORT;

    const dref = emergencyResponse?.dref;
    // event.dtype is copied from the dref once at approval and not resynced,
    // so prefer the latest revision's disaster type at DREF stages
    const disasterTypeId = (isDrefStage
        ? dref?.final_report_details?.disaster_type_details?.id
            ?? dref?.operational_update_details?.disaster_type_details?.id
            ?? dref?.disaster_type_details?.id
        : undefined)
        ?? emergencyResponse?.dtype;

    return (
        <TabPage
            pending={emergencyResponsePending || databankResponsePending}
            headerAction={isDefined(countryId) ? (
                <Link
                    to="countryProfilePreviousEvents"
                    urlParams={{ countryId }}
                    withLinkIcon
                    withUnderline
                >
                    {strings.seeMoreOnCountryPageLink}
                </Link>
            ) : undefined}
        >
            {emergencyResponse?.stage !== STAGE_FIELD_REPORT
                && isDefined(emergencyResponse)
                && isDefined(disasterTypeId)
                && isDefined(country) && (
                <EmergencyLessonsLearnedFromPreviousOperations
                    disasterType={disasterTypeId}
                    country={country.id}
                />
            )}
            <CountryPastEventsChart
                countryId={String(countryId)}
                disasterType={disasterTypeId}
            />
            <CountrySeasonalCalendar
                acapsEvents={databankResponse?.acaps}
            />
        </TabPage>
    );
}

Component.displayName = 'EmergencyBackground';
