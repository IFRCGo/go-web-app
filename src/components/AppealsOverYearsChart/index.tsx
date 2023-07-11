import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import YearlyChart from './YearlyChart';
import MonthlyChart from './MonthlyChart';

interface Props {
    regionId?: number;
}

function AppealsOverYearsChart(props: Props) {
    const { regionId } = props;
    const [year, setYear] = useState<number | undefined>();

    if (isNotDefined(year)) {
        return (
            <YearlyChart
                regionId={regionId}
                onYearClick={setYear}
            />
        );
    }

    return (
        <MonthlyChart
            year={year}
            regionId={regionId}
            onBackButtonClick={setYear}
        />
    );
}

export default AppealsOverYearsChart;
