import { useContext, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import {
    createNumberColumn,
    createStringColumn,
    createLinkColumn,
    createProgressColumn,
    createCountryListColumn,
    createDateColumn,
    createDateRangeColumn,
} from '#components/Table/ColumnShortcuts';
import SeverityIndicator from '#components/SeverityIndicator';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import type { paths } from '#generated/types';
import { getDuration } from '#utils/common';

import i18n from './i18n.json';

type GetSearch = paths['/api/v1/search/']['get'];
type SearchResponse = GetSearch['responses']['200']['content']['application/json'];
type EmergencyResult = NonNullable<SearchResponse['emergencies']>[number];
type FieldReportResult = NonNullable<SearchResponse['reports']>[number];
type ProjectResult = NonNullable<SearchResponse['projects']>[number];
type RapidResponseDeploymentResult = NonNullable<SearchResponse['rapid_response_deployments']>[number];
type SurgeAlertResult = NonNullable<SearchResponse['surge_alerts']>[number];
type SurgeDeploymentResult = NonNullable<SearchResponse['surge_deployments']>[number];

type Strings = (typeof i18n)['strings'];

function getEmergencyColumns(
    strings: Strings,
    emergencyRoutePath: string,
) {
    return [
        createLinkColumn<EmergencyResult, number>(
            'title',
            strings.searchEmergencyTableTitle,
            (emergency) => emergency.name,
            (emergency) => ({
                to: generatePath(
                    emergencyRoutePath,
                    { emergencyId: String(emergency.id) },
                ),
                icons: (
                    <SeverityIndicator
                        title={emergency.severity_level_display}
                        level={emergency.severity_level}
                    />
                ),
            }),
        ),
        createStringColumn<EmergencyResult, number>(
            'appeal_type',
            strings.searchEmergencyTableAppealType,
            (emergency) => emergency.appeal_type ?? '-',
        ),
        createStringColumn<EmergencyResult, number>(
            'disaster_type',
            strings.searchEmergencyTableDisasterType,
            (emergency) => emergency.disaster_type,
        ),
        createNumberColumn<EmergencyResult, number>(
            'funding_requirements',
            strings.searchEmergencyTableFundingRequirements,
            (emergency) => Number(emergency.funding_requirements),
            {
                unit: ' CHF',
            },
        ),
        createProgressColumn<EmergencyResult, number>(
            'funding_coverage',
            strings.searchEmergencyTableFundingCoverage,
            (emergency) => 100 * (
                Number(emergency.funding_coverage) / Number(emergency.funding_requirements)
            ),
        ),
        createCountryListColumn<EmergencyResult, number>(
            'countries',
            strings.searchEmergencyTableCountry,
            (item) => item.countries,
        ),
    ];
}

function getFieldReportColumns(strings: Strings) {
    return [
        createDateColumn<FieldReportResult, number>(
            'created_at',
            strings.searchFieldReportTableDate,
            (fieldReport) => fieldReport.created_at,
        ),
        createStringColumn<FieldReportResult, number>(
            'type',
            strings.searchFieldReportTableType,
            (fieldReport) => fieldReport.type,
        ),
        createLinkColumn<FieldReportResult, number>(
            'name',
            strings.searchFieldReportTableTitle,
            (fieldReport) => fieldReport.name,
            (fieldReport) => ({
                // FIXME: use from routes
                to: `/reports/${fieldReport.id}`,
            }),
        ),
    ];
}

function getProjectColumns(strings: Strings, emergencyRoutePath: string) {
    return [
        createLinkColumn<ProjectResult, number>(
            'emergency_name',
            strings.searchProjectTableEmergency,
            (project) => project.event_name,
            (project) => ({
                to: generatePath(
                    emergencyRoutePath,
                    { emergencyId: String(project.event_id) },
                ),
            }),
        ),
        createStringColumn<ProjectResult, number>(
            'national_society',
            strings.searchProjectTableNationalSociety,
            (project) => project.national_society,
        ),
        createLinkColumn<ProjectResult, number>(
            'name',
            strings.searchProjectTableProjectName,
            (project) => project.name,
            (project) => ({
                // FIXME: use route path
                to: `/three-w/${project.id}`,
            }),
        ),
        createDateRangeColumn<ProjectResult, number>(
            'start_date',
            strings.searchProjectTableStartEndDate,
            (project) => ({
                startDate: project.start_date,
                endDate: project.end_date,
            }),
        ),
        createStringColumn<ProjectResult, number>(
            'sector',
            strings.searchProjectTableSector,
            (project) => project.sector,
        ),
        createNumberColumn<ProjectResult, number>(
            'people_targeted',
            strings.searchProjectTablePeopleTargeted,
            (project) => project.people_targeted,
        ),
    ];
}

function getRapidResponseDeploymentColumns(
    strings: Strings,
    countryRoutePath: string,
    emergencyRoutePath: string,
) {
    return [
        createDateColumn<RapidResponseDeploymentResult, number>(
            'start_date',
            strings.searchRapidDeploymentTableStartDate,
            (rapidResponse) => rapidResponse.start_date,
        ),
        createDateColumn<RapidResponseDeploymentResult, number>(
            'end_date',
            strings.searchRapidDeploymentTableEndDate,
            (rapidResponse) => rapidResponse.end_date,
        ),
        createStringColumn<RapidResponseDeploymentResult, number>(
            'name',
            strings.searchRapidDeploymentTableName,
            (rapidResponse) => rapidResponse.name,
        ),
        createStringColumn<RapidResponseDeploymentResult, number>(
            'position',
            strings.searchRapidDeploymentTablePosition,
            (rapidResponse) => rapidResponse.position,
        ),
        createStringColumn<RapidResponseDeploymentResult, number>(
            'keywords',
            strings.searchRapidDeploymentTableKeywords,
            (rapidResponse) => rapidResponse.type,
        ),
        createLinkColumn<RapidResponseDeploymentResult, number>(
            'deploying_country_name',
            strings.searchRapidDeploymentTableDeployingParty,
            (rapidResponse) => rapidResponse.deploying_country_name,
            (rapidResponse) => ({
                to: isDefined(rapidResponse.deploying_country_id)
                    ? generatePath(
                        countryRoutePath,
                        { countryId: String(rapidResponse.deploying_country_id) },
                    ) : undefined,
            }),
        ),
        createLinkColumn<RapidResponseDeploymentResult, number>(
            'deployed_to_country_name',
            strings.searchRapidDeploymentTableDeployedTo,
            (rapidResponse) => rapidResponse.deployed_to_country_name,
            (rapidResponse) => ({
                to: isDefined(rapidResponse.deployed_to_country_id)
                    ? generatePath(
                        countryRoutePath,
                        { countryId: String(rapidResponse.deployed_to_country_id) },
                    ) : undefined,
            }),
        ),
        createLinkColumn<RapidResponseDeploymentResult, number>(
            'event_name',
            strings.searchRapidDeploymentTableEmergency,
            (rapidResponse) => rapidResponse.event_name,
            (rapidResponse) => ({
                to: generatePath(
                    emergencyRoutePath,
                    { emergencyId: rapidResponse.event_id },
                ),
            }),
        ),
    ];
}

function getSurgeAlertColumns(strings: Strings) {
    return [
        createDateColumn<SurgeAlertResult, number>(
            'alert_date',
            strings.searchSurgeAlertTableAlertDate,
            (surgeAlert) => surgeAlert.alert_date,
        ),
        // TODO: createDurationColumn
        createStringColumn<SurgeAlertResult, number>(
            'duration',
            strings.searchSurgeAlertTableDuration,
            (surgeAlert) => {
                if (!surgeAlert.alert_date) {
                    return '-';
                }

                const alertDate = new Date(surgeAlert.alert_date);
                const deadline = new Date(surgeAlert.deadline);
                const duration = getDuration(alertDate, deadline);

                return duration;
            },
        ),
        createDateColumn<SurgeAlertResult, number>(
            'start_date',
            strings.searchSurgeAlertTableStartDate,
            (surgeAlert) => surgeAlert.start_date,
        ),
        createStringColumn<SurgeAlertResult, number>(
            'name',
            strings.searchSurgeAlertTablePosition,
            (surgeAlert) => surgeAlert.name,
        ),
        createStringColumn<SurgeAlertResult, number>(
            'keywords',
            strings.searchSurgeAlertTableKeywords,
            (surgeAlert) => surgeAlert.keywords?.join(', '),
        ),
        createLinkColumn<SurgeAlertResult, number>(
            'event_name',
            strings.searchSurgeAlertTableEmergency,
            (surgeAlert) => surgeAlert.event_name,
            (surgeAlert) => ({
                to: `/emergencies/${surgeAlert.event_id}`,
            }),
        ),
        createLinkColumn<SurgeAlertResult, number>(
            'country',
            strings.searchSurgeAlertTableCountry,
            (surgeAlert) => surgeAlert.country,
            (surgeAlert) => ({
                to: `/countries/${surgeAlert.country_id}`,
            }),
        ),
        createStringColumn<SurgeAlertResult, number>(
            'status',
            strings.searchSurgeAlertTableStatus,
            (surgeAlert) => surgeAlert.status,
        ),
    ];
}

function getSurgeDeploymentColumns(strings: Strings, countryPath: string, emergencyPath: string) {
    return [
        createStringColumn<SurgeDeploymentResult, number>(
            'owner',
            strings.searchSurgeDeploymentTableOwner,
            (surgeDeployment) => surgeDeployment.owner,
        ),
        createStringColumn<SurgeDeploymentResult, number>(
            'type',
            strings.searchSurgeDeploymentTableType,
            (surgeDeployment) => surgeDeployment.type,
        ),
        createNumberColumn<SurgeDeploymentResult, number>(
            'personnel_units',
            strings.searchSurgeDeploymentTablePersonnelUnits,
            (surgeDeployment) => surgeDeployment.personnel_units,
        ),
        createNumberColumn<SurgeDeploymentResult, number>(
            'equipment_units',
            strings.searchSurgeDeploymentTableEquipmentUnits,
            (surgeDeployment) => surgeDeployment.equipment_units,
        ),
        createLinkColumn<SurgeDeploymentResult, number>(
            'deployed_country',
            strings.searchSurgeDeploymentsTableCountryDeployedTo,
            (surgeDeployment) => surgeDeployment.deployed_country,
            (surgeDeployment) => ({
                to: generatePath(
                    countryPath,
                    { countryId: surgeDeployment.deployed_country_id },
                ),
            }),
        ),
        createLinkColumn<SurgeDeploymentResult, number>(
            'event_name',
            strings.searchSurgeDeploymentsTableEmergency,
            (surgeDeployment) => surgeDeployment.event_name,
            (surgeDeployment) => ({
                to: isDefined(surgeDeployment.event_id)
                    ? generatePath(emergencyPath, { emergencyId: surgeDeployment.event_id })
                    : undefined,
            }),
        ),
    ];
}

function useColumns(searchResponse: SearchResponse | undefined) {
    const strings = useTranslation(i18n);
    const {
        emergency: emergencyRoute,
        country: countryRoute,
    } = useContext(RouteContext);

    const columnMap = useMemo(
        () => ({
            reports: {
                columns: getFieldReportColumns(strings),
                keySelector: (item: FieldReportResult) => item.id,
                data: searchResponse?.reports as FieldReportResult[],
            },
            emergencies: {
                columns: getEmergencyColumns(
                    strings,
                    emergencyRoute.absolutePath,
                ),
                keySelector: (item: EmergencyResult) => item.id,
                data: searchResponse?.emergencies as EmergencyResult[],
            },
            projects: {
                columns: getProjectColumns(
                    strings,
                    emergencyRoute.absolutePath,
                ),
                keySelector: (item: ProjectResult) => item.id,
                data: searchResponse?.projects,
            },
            rapid_response_deployments: {
                columns: getRapidResponseDeploymentColumns(
                    strings,
                    countryRoute.absolutePath,
                    emergencyRoute.absolutePath,
                ),
                keySelector: (item: RapidResponseDeploymentResult) => item.id,
                data: searchResponse?.rapid_response_deployments,
            },
            surge_alerts: {
                columns: getSurgeAlertColumns(strings),
                keySelector: (item: SurgeAlertResult) => item.id,
                data: searchResponse?.surge_alerts,
            },
            surge_deployments: {
                columns: getSurgeDeploymentColumns(
                    strings,
                    countryRoute.absolutePath,
                    emergencyRoute.absolutePath,
                ),
                keySelector: (item: SurgeDeploymentResult) => item.id,
                data: searchResponse?.surge_deployments,
            },
        }),
        [strings, countryRoute, emergencyRoute, searchResponse],
    );

    return columnMap;
}

export default useColumns;
