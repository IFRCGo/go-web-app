import { useMemo, useState } from 'react';
import { encodeDate, listToMap } from '@togglecorp/fujs';
import { useRequest } from '#utils/restRequest';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import Button from '#components/Button';
import { getDatesSeparatedByMonths } from '#utils/chart';

import TimelineChart from '../TimelineChart';
import PointDetails from '../PointDetails';

import styles from './styles.module.css';

const APPEAL_TYPE_EMERGENCY = 1;
const APPEAL_TYPE_DREF = 0;

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
    const dateList = useMemo(
        () => {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            return getDatesSeparatedByMonths(startDate, endDate);
        },
        [year],
    );

    const [activePointKey, setActivePointKey] = useState<string>(
        getFormattedKey(dateList[0]),
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

    const dataKeyToClassNameMap = {
        dref: styles.dref,
        emergencyAppeal: styles.emergencyAppeal,
    };

    const activePointData = activePointKey ? dateListWithData[activePointKey] : undefined;

    return (
        <Container
            className={styles.monthlyChart}
            childrenContainerClassName={styles.chartContainer}
            heading={`Appeals by Month for ${year}`}
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
                        xAxisFormatter={(date) => date.toLocaleString(
                            undefined,
                            { month: 'short' },
                        )}
                    />
                    <PointDetails
                        heading={dateFormatter.format(activePointData?.date) ?? '--'}
                        data={activePointData}
                        action={activePointData && (
                            <Button
                                name={undefined}
                                onClick={onBackButtonClick}
                            >
                                Back to yearly
                            </Button>
                        )}
                    />
                </>
            )}
        </Container>
    );
}

export default MonthlyChart;
