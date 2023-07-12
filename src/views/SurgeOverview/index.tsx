import { useMemo, useCallback } from 'react';
import Container from '#components/Container';
import { resolveToString } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import BarChart from '#components/BarChart';
import TimeSeriesChart from '#components/TimeSeriesChart';
import { getDatesSeparatedByMonths } from '#utils/chart';
import { paths } from '#generated/types';

import SurgeMap from './SurgeMap';
import SurgeAlertsTable from './SurgeAlertsTable';
import PersonnelByEventTable from './PersonnelByEventTable';
import EmergencyResponseUnitsTable from './EmergencyResponseUnitsTable';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDeploymentsByMonth = paths['/api/v2/deployment/aggregated_by_month']['get'];
type GetDeploymentsByMonthResponse = GetDeploymentsByMonth['responses']['200']['content']['application/json'];

type GetDeploymentsByNationalSociety = paths['/api/v2/deployment/aggregated_by_ns']['get'];
type GetDeploymentsByNationalSocietyResponse = GetDeploymentsByNationalSociety['responses']['200']['content']['application/json'];
type DeploymentsByNationalSociety = GetDeploymentsByNationalSocietyResponse[number];

const timeSeriesDataKeys = ['deployments'];

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
oneYearAgo.setMonth(oneYearAgo.getMonth() + 1);
oneYearAgo.setHours(0, 0, 0, 0);

const xAxisFormatter = (date: Date) => date.toLocaleString(
    undefined,
    { month: 'short' },
);

function timeseriesChartClassNameSelector() {
    return styles.deploymentsChart;
}

function deploymentSelector(deployment: DeploymentsByNationalSociety) {
    return deployment.id;
}

function deploymentCountSelector(deployment: DeploymentsByNationalSociety) {
    return deployment.deployments_count ?? 0;
}

function deploymentNationalSocietySelector(deployment: DeploymentsByNationalSociety) {
    return deployment.society_name;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        response: deploymentsByNationalSocietyResponse,
    } = useRequest<GetDeploymentsByNationalSocietyResponse>({
        url: '/api/v2/deployment/aggregated_by_ns/',
    });

    const {
        response: deploymentsByMonth,
    } = useRequest<GetDeploymentsByMonthResponse>({
        url: '/api/v2/deployment/aggregated_by_month/',
    });

    const dateList = useMemo(
        () => {
            const startDate = oneYearAgo;
            const endDate = new Date();
            return getDatesSeparatedByMonths(startDate, endDate);
        },
        [],
    );

    const timeSeriesValueSelector = useCallback(
        (_: string, date: Date) => deploymentsByMonth?.find((deployment) => (
            getFormattedKey(deployment.date) === getFormattedKey(date)))?.count ?? 0,
        [deploymentsByMonth],
    );

    return (
        <div className={styles.surgeOverview}>
            <SurgeMap />
            <div className={styles.charts}>
                <Container
                    heading={resolveToString(strings.topFiveNationalSociety, { year: '2023' })}
                    className={styles.deploymentsByNationalSociety}
                    withHeaderBorder
                >
                    <BarChart
                        data={deploymentsByNationalSocietyResponse ?? []}
                        keySelector={deploymentSelector}
                        valueSelector={deploymentCountSelector}
                        labelSelector={deploymentNationalSocietySelector}
                    />
                </Container>
                <Container
                    heading={strings.ongoingDeployments}
                    className={styles.deploymentsOverLastYear}
                    withHeaderBorder
                >
                    {deploymentsByNationalSocietyResponse && (
                        <TimeSeriesChart
                            className={styles.timeSeriesChart}
                            timePoints={dateList}
                            dataKeys={timeSeriesDataKeys}
                            valueSelector={timeSeriesValueSelector}
                            classNameSelector={timeseriesChartClassNameSelector}
                            xAxisFormatter={xAxisFormatter}
                        />
                    )}
                </Container>
            </div>
            <SurgeAlertsTable />
            <PersonnelByEventTable />
            <EmergencyResponseUnitsTable />
        </div>
    );
}

Component.displayName = 'SurgeOverview';
