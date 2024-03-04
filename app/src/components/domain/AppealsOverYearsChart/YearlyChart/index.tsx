import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    Message,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getDatesSeparatedByYear,
    getFormattedDateKey,
} from '@ifrc-go/ui/utils';
import {
    encodeDate,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

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
        () => getFormattedDateKey(dateList[dateList.length - 1]),
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
        error: appealResponseError,
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
                (appeal) => getFormattedDateKey(appeal.timespan),
            );

            const emergencyAppealData = listToMap(
                monthlyEmergencyAppealResponse,
                (appeal) => getFormattedDateKey(appeal.timespan),
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
        (date) => getFormattedDateKey(date),
        (date, key) => ({
            date,
            dref: combinedData?.dref?.[key],
            emergencyAppeal: combinedData?.emergencyAppeal?.[key],
        }),
    );

    const activePointData = activePointKey ? dateListWithData[activePointKey] : undefined;
    const chartValueSelector = useCallback(
        (dataKey: DATA_KEY, date: Date) => (
            combinedData?.[dataKey]?.[getFormattedDateKey(date)]?.count
        ),
        [combinedData],
    );

    const shouldHideChart = pending && isDefined(appealResponseError);

    return (
        <Container
            className={styles.yearlyChart}
            childrenContainerClassName={styles.chartContainer}
            heading={strings.yearlyAppealChartTitle}
            withHeaderBorder
        >
            {pending && <BlockLoading className={styles.loading} />}
            {isDefined(appealResponseError) && (
                <Message
                    title={strings.yearlyAppealChartNotAvailableMessage}
                />
            )}
            {!shouldHideChart && !appealResponseError && (
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
                                {strings.yearlyAppealChartViewMonthlyLabel}
                            </Button>
                        )}
                    />
                </>
            )}
        </Container>
    );
}

export default YearlyChart;
