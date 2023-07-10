import { useMemo, useCallback } from 'react';
import { mapToMap } from '@togglecorp/fujs';
import Container from '#components/Container';
import { resolveToString } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import BarChart from '#components/BarChart';
import TimeSeriesChart from '#components/TimeSeriesChart';
import { getDatesSeparatedByMonths } from '#utils/chart';

import SurgeMap from './SurgeMap';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface DeploymentsByNationalSociety {
    id: number;
    deployments_count: number;
    society_name: number;
}

// TODO: use typings from server
type DeploymentsByMonth = Record<string, number>;
// TODO: use typings from server
type DeploymentsByNationalSocietyResponse = DeploymentsByNationalSociety[];

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
    return deployment.deployments_count;
}

function deploymentNationalSocietySelector(deployment: DeploymentsByNationalSociety) {
    return deployment.society_name;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        response: deploymentsByNationalSocietyResponse,
    } = useRequest<DeploymentsByNationalSocietyResponse>({
        url: '/api/v2/deployment/aggregated_by_ns/',
    });

    const {
        response: deploymentsByMonth,
    } = useRequest<DeploymentsByMonth>({
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

    const formattedDeploymentsByMonth = useMemo(
        () => (
            mapToMap(
                deploymentsByMonth,
                (key) => getFormattedKey(key),
            )
        ),
        [deploymentsByMonth],
    );

    const timeSeriesValueSelector = useCallback(
        (_: string, date: Date) => formattedDeploymentsByMonth?.[getFormattedKey(date)] ?? 0,
        [formattedDeploymentsByMonth],
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
        </div>
    );
}

Component.displayName = 'SurgeOverview';
