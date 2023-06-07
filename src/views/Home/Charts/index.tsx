import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import YearlyChart from './YearlyChart';
import MonthlyChart from './MonthlyChart';

function Charts() {
    const [year, setYear] = useState<number | undefined>();

    if (isNotDefined(year)) {
        return (
            <YearlyChart
                onYearClick={setYear}
            />
        );
    }

    return (
        <MonthlyChart
            year={year}
            onBackButtonClick={setYear}
        />
    );
}

export default Charts;
