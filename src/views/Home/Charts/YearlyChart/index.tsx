import { useMemo, useState } from 'react';
import { encodeDate, listToMap } from '@togglecorp/fujs';
import { useRequest } from '#utils/restRequest';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import Button from '#components/Button';
import { getDatesSeparatedByYear } from '#utils/chart';

import TimelineChart from '../TimelineChart';

import styles from './styles.module.css';
import PointDetails from '../PointDetails';

const APPEAL_TYPE_EMERGENCY = 1;
const APPEAL_TYPE_DREF = 0;

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

const now = new Date();
const startDate = new Date(now.getFullYear() - 10, 0, 1);
const endDate = new Date(now.getFullYear(), 11, 31);

interface Props {
    onYearClick: (year: number) => void;
}

function YearlyChart(props: Props) {
    const {
        onYearClick,
    } = props;

    const dateList = useMemo(
        () => getDatesSeparatedByYear(startDate, endDate),
        [],
    );

    const [activePointKey, setActivePointKey] = useState<string>(
        getFormattedKey(dateList[dateList.length - 1]),
    );

    const queryParams = {
        model_type: 'appeal',
        start_date: encodeDate(startDate),
        end_date: encodeDate(endDate),
        sum_amount_funded: 'amount_funded',
        sum_beneficiaries: 'num_beneficiaries',
        unit: 'year',
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

    const dataKeyToClassNameMap = {
        dref: styles.dref,
        emergencyAppeal: styles.emergencyAppeal,
    };

    const activePointData = activePointKey ? dateListWithData[activePointKey] : undefined;

    return (
        <Container
            className={styles.yearlyChart}
            childrenContainerClassName={styles.chartContainer}
            heading="Appeals over the last 10 years"
            withHeaderBorder
        >
            {pending && <BlockLoading className={styles.loading} />}
            {!pending && (
                <>
                    <TimelineChart
                        className={styles.timelineChart}
                        timePoints={dateList}
                        dataKeys={['dref', 'emergencyAppeal']}
                        valueSelector={(dataKey, date) => (
                            combinedData?.[dataKey]?.[getFormattedKey(date)]?.count ?? 0
                        )}
                        classNameSelector={(dataKey) => dataKeyToClassNameMap[dataKey]}
                        activePointKey={activePointKey}
                        onTimePointClick={setActivePointKey}
                        xAxisFormatter={(date) => date.toLocaleString(undefined, { year: 'numeric' })}
                    />
                    <PointDetails
                        heading={activePointData?.date.getFullYear() ?? '--'}
                        data={activePointData}
                        action={activePointData && (
                            <Button
                                name={activePointData.date.getFullYear()}
                                onClick={onYearClick}
                            >
                                View monthly
                            </Button>
                        )}
                    />
                </>
            )}
        </Container>
    );
}

export default YearlyChart;
