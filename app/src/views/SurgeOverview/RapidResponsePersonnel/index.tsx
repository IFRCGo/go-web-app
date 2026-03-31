import {
    useCallback,
    useMemo,
} from 'react';
import {
    BarChart,
    Container,
    ListView,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getDatesSeparatedByMonths,
    getFormattedDateKey,
    resolveToString,
} from '@ifrc-go/ui/utils';

import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';
import ActiveRapidResponseTable from '#views/ActiveSurgeDeployments/ActiveRapidResponseTable';
import OngoingRapidResponseDeployments from '#views/ActiveSurgeDeployments/OngoingRapidResponseDeployments';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDeploymentsByNationalSocietyResponse = GoApiResponse<'/api/v2/deployment/aggregated_by_ns'>;
type DeploymentsByNationalSociety = GetDeploymentsByNationalSocietyResponse[number];

const timeSeriesDataKeys = ['deployments'];

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
oneYearAgo.setDate(1);
oneYearAgo.setMonth(oneYearAgo.getMonth() + 1);
oneYearAgo.setHours(0, 0, 0, 0);

const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { month: 'short' },
);

function timeseriesChartClassNameSelector() {
    return styles.deploymentsChart ?? '';
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

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        pending: deploymentByNationalSocietyPending,
        response: deploymentsByNationalSocietyResponse,
    } = useRequest({
        url: '/api/v2/deployment/aggregated_by_ns',
    });

    const {
        pending: deploymentsByMonthPending,
        response: deploymentsByMonth,
    } = useRequest({
        url: '/api/v2/deployment/aggregated_by_month',
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
        (_: string, date: Date) => deploymentsByMonth?.find(
            (deployment) => (
                getFormattedDateKey(deployment.date) === getFormattedDateKey(date)
            ),
        )?.count ?? 0,
        [deploymentsByMonth],
    );

    const pending = deploymentByNationalSocietyPending || deploymentsByMonthPending;

    return (
        <TabPage>
            <ListView
                layout="grid"
                minGridColumnSize="20rem"
            >
                <Container
                    heading={resolveToString(strings.topFiveNationalSociety, { year: '2025' })}
                    withHeaderBorder
                    pending={pending}
                    withPadding
                    withBackground
                    withShadow
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
                    withHeaderBorder
                    pending={pending}
                    withPadding
                    withBackground
                    withShadow
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
            </ListView>
            <ActiveRapidResponseTable />
            <OngoingRapidResponseDeployments />
        </TabPage>
    );
}

Component.displayName = 'RapidResponsePersonnel';
