import { useMemo, useState, useCallback } from 'react';
import { encodeDate, listToMap } from '@togglecorp/fujs';
import { useRequest } from '#utils/restRequest';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import Button from '#components/Button';
import { getDatesSeparatedByMonths } from '#utils/chart';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';

import TimelineChart from '../TimelineChart';
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

const dataKeyToClassNameMap = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
};
const classNameSelector = (dataKey: DATA_KEY) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(
    undefined,
    { month: 'short' },
);

const dateFormatter = new Intl.DateTimeFormat(
    undefined,
    {
        month: 'long',
    },
);

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

interface AggregateResponse {
    aggregate: {
        timespan: string;
        count: number;
        amount_funded: string;
        beneficiaries: number;
    }[];
}

interface Props {
    year: number;
    onBackButtonClick: (year: undefined) => void;
}

function MonthlyChart(props: Props) {
    const {
        year,
        onBackButtonClick,
    } = props;
    const strings = useTranslation(i18n);
    const dateList = useMemo(
        () => {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            return getDatesSeparatedByMonths(startDate, endDate);
        },
        [year],
    );

    const [activePointKey, setActivePointKey] = useState<string>(
        () => getFormattedKey(dateList[0]),
    );

    const queryParams = {
        model_type: 'appeal',
        start_date: encodeDate(new Date(year, 0, 1)),
        end_date: encodeDate(new Date(year, 11, 31)),
        sum_amount_funded: 'amount_funded',
        sum_beneficiaries: 'num_beneficiaries',
        unit: 'month',
    };

    const {
        pending: monthlyEmergencyAppealPending,
        response: monthlyEmergencyAppealResponse,
    } = useRequest<AggregateResponse>({
        url: 'api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_EMERGENCY,
            ...queryParams,
        },
    });

    const {
        response: monthlyDrefResponse,
        pending: monthlyDrefPending,
    } = useRequest<AggregateResponse>({
        url: 'api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_DREF,
            ...queryParams,
        },
    });

    const pending = monthlyEmergencyAppealPending || monthlyDrefPending;

    const combinedData = useMemo(
        () => {
            if (!monthlyDrefResponse || !monthlyEmergencyAppealResponse) {
                return undefined;
            }

            const drefData = listToMap(
                monthlyDrefResponse.aggregate,
                (appeal) => getFormattedKey(appeal.timespan),
            );

            const emergencyAppealData = listToMap(
                monthlyEmergencyAppealResponse.aggregate,
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
            dref: combinedData?.dref[key],
            emergencyAppeal: combinedData?.emergencyAppeal[key],
        }),
    );

    const activePointData = activePointKey ? dateListWithData[activePointKey] : undefined;
    const heading = resolveToComponent(
        strings.homeMonthlyChartTitle,
        { year: year ?? '--' },
    );
    const chartValueSelector = useCallback(
        (dataKey: DATA_KEY, date: Date) => (
            combinedData?.[dataKey]?.[getFormattedKey(date)]?.count ?? 0
        ),
        [combinedData],
    );

    return (
        <Container
            className={styles.monthlyChart}
            childrenContainerClassName={styles.chartContainer}
            heading={heading}
            withHeaderBorder
        >
            {pending && <BlockLoading className={styles.loading} />}
            {!pending && (
                <>
                    <TimelineChart
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
                        heading={dateFormatter.format(activePointData?.date) ?? '--'}
                        data={activePointData}
                        action={activePointData && (
                            <Button
                                name={undefined}
                                onClick={onBackButtonClick}
                            >
                                {strings.homeMonthlyChartBackButtonLabel}
                            </Button>
                        )}
                    />
                </>
            )}
        </Container>
    );
}

export default MonthlyChart;
