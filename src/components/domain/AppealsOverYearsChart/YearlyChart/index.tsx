import { useMemo, useState, useCallback } from 'react';
import { encodeDate, listToMap, isNotDefined } from '@togglecorp/fujs';
import { useRequest } from '#utils/restRequest';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TimeSeriesChart from '#components/TimeSeriesChart';
import Button from '#components/Button';
import { getDatesSeparatedByYear } from '#utils/chart';
import useTranslation from '#hooks/useTranslation';
import { formatDate } from '#utils/common';

import PointDetails from '../PointDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

const APPEAL_TYPE_EMERGENCY = 1;
const APPEAL_TYPE_DREF = 0;

type DATA_KEY = 'dref' | 'emergencyAppeal';

const dataKeys: DATA_KEY[] = [
    'dref',
    'emergencyAppeal',
];

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return formatDate(date, 'yyyy-MM');
};

// FIXME: use a separate utility
const now = new Date();
const startDate = new Date(now.getFullYear() - 10, 0, 1);
const endDate = new Date(now.getFullYear(), 11, 31);
const dateList = getDatesSeparatedByYear(startDate, endDate);

const dataKeyToClassNameMap = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
};
const classNameSelector = (dataKey: DATA_KEY) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { year: 'numeric' },
);

interface Props {
    onYearClick: (year: number) => void;
    regionId?: number;
}

function YearlyChart(props: Props) {
    const {
        onYearClick,
        regionId,
    } = props;
    const strings = useTranslation(i18n);

    const [activePointKey, setActivePointKey] = useState<string>(
        () => getFormattedKey(dateList[dateList.length - 1]),
    );

    const queryParams = {
        model_type: 'appeal',
        start_date: encodeDate(startDate),
        end_date: encodeDate(endDate),
        sum_amount_funded: 'amount_funded',
        sum_beneficiaries: 'num_beneficiaries',
        unit: 'year',
        region: regionId,
    };

    const {
        pending: monthlyEmergencyAppealPending,
        response: monthlyEmergencyAppealResponse,
    } = useRequest({
        url: '/api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_EMERGENCY,
            ...queryParams,
            // FIXME: fix typing in server (low priority)
        } as never,
    });

    const {
        response: monthlyDrefResponse,
        pending: monthlyDrefPending,
    } = useRequest({
        url: '/api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_DREF,
            ...queryParams,
            // FIXME: fix typing in server (low priority)
        } as never,
    });

    const pending = monthlyEmergencyAppealPending || monthlyDrefPending;

    const combinedData = useMemo(
        () => {
            if (isNotDefined(monthlyDrefResponse) || isNotDefined(monthlyEmergencyAppealResponse)) {
                return undefined;
            }

            const drefData = listToMap(
                monthlyDrefResponse,
                (appeal) => getFormattedKey(appeal.timespan),
            );

            const emergencyAppealData = listToMap(
                monthlyEmergencyAppealResponse,
                (appeal) => getFormattedKey(appeal.timespan),
            );

            const data = {
                dref: drefData,
                emergencyAppeal: emergencyAppealData,
            };

            return data;
        },
        [monthlyEmergencyAppealResponse, monthlyDrefResponse],
    );

    const dateListWithData = listToMap(
        dateList,
        (date) => getFormattedKey(date),
        (date, key) => ({
            date,
            dref: combinedData?.dref?.[key],
            emergencyAppeal: combinedData?.emergencyAppeal?.[key],
        }),
    );

    const activePointData = activePointKey ? dateListWithData[activePointKey] : undefined;
    const chartValueSelector = useCallback(
        (dataKey: DATA_KEY, date: Date) => (
            combinedData?.[dataKey]?.[getFormattedKey(date)]?.count
        ),
        [combinedData],
    );

    return (
        <Container
            className={styles.yearlyChart}
            childrenContainerClassName={styles.chartContainer}
            heading={strings.homeYearlyChartTitle}
            withHeaderBorder
        >
            {pending && <BlockLoading className={styles.loading} />}
            {!pending && (
                <>
                    <TimeSeriesChart
                        className={styles.timelineChart}
                        timePoints={dateList}
                        dataKeys={dataKeys}
                        valueSelector={chartValueSelector}
                        classNameSelector={classNameSelector}
                        activePointKey={activePointKey}
                        onTimePointClick={setActivePointKey}
                        xAxisFormatter={xAxisFormatter}
                    />
                    <PointDetails
                        heading={activePointData?.date.getFullYear() ?? '--'}
                        data={activePointData}
                        action={activePointData && (
                            <Button
                                name={activePointData.date.getFullYear()}
                                onClick={onYearClick}
                                variant="secondary"
                            >
                                {strings.homeYearlyChartViewMonthlyLabel}
                            </Button>
                        )}
                    />
                </>
            )}
        </Container>
    );
}

export default YearlyChart;
