import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getDatesSeparatedByMonths,
    getFormattedDateKey,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    encodeDate,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';

import PointDetails from '../PointDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: these must be a constant defined somewhere else
// with satisfies
const APPEAL_TYPE_DREF = 0;
const APPEAL_TYPE_EMERGENCY = 1;

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
    navigator.language,
    { month: 'short' },
);

const dateFormatter = new Intl.DateTimeFormat(
    navigator.language,
    { month: 'long' },
);

const currentDate = new Date();

interface Props {
    regionId?: number;
    year: number;
    onBackButtonClick: (year: undefined) => void;
}

function MonthlyChart(props: Props) {
    const {
        year,
        regionId,
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
        () => getFormattedDateKey(dateList[0]),
    );

    const query = {
        model_type: 'appeal',
        start_date: encodeDate(new Date(year, 0, 1)),
        end_date: encodeDate(new Date(year, 11, 31)),
        sum_amount_funded: 'amount_funded',
        sum_beneficiaries: 'num_beneficiaries',
        unit: 'month',
        region: regionId,
    };

    const {
        pending: monthlyEmergencyAppealPending,
        response: monthlyEmergencyAppealResponse,
    } = useRequest({
        url: '/api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_EMERGENCY,
            ...query,
            // FIXME: need to fix typing in server (low priority)
        } as never,
    });

    const {
        response: monthlyDrefResponse,
        pending: monthlyDrefPending,
    } = useRequest({
        url: '/api/v1/aggregate/',
        query: {
            filter_atype: APPEAL_TYPE_DREF,
            ...query,
            // FIXME: need to fix the typing in server (low priority)
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
    const heading = resolveToComponent(
        strings.homeMonthlyChartTitle,
        { year: year ?? '--' },
    );
    const chartValueSelector = useCallback(
        (dataKey: DATA_KEY, date: Date) => {
            const value = combinedData?.[dataKey]?.[getFormattedDateKey(date)]?.count;
            // NOTE: if there are missing values for a given month or year
            // less then the current date we assume the value to be 0
            // FIXME: This could be done in the aggregation logic of the server itself
            if (isNotDefined(value) && date < currentDate) {
                return 0;
            }

            return combinedData?.[dataKey]?.[getFormattedDateKey(date)]?.count;
        },
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
                        heading={dateFormatter.format(activePointData?.date) ?? '--'}
                        data={activePointData}
                        action={activePointData && (
                            <Button
                                variant="secondary"
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
