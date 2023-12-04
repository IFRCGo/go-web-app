import { useMemo } from 'react';

import useTranslation from '#hooks/useTranslation';
import Table from '#components/Table';
import { createNumberColumn, createStringColumn } from '#components/Table/ColumnShortcuts';
import { numericIdSelector } from '#utils/selectors';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type GetCountryPlanResponse = GoApiResponse<'/api/v2/country-plan/{country}/'>;

interface Props {
    className?: string,
    priorityData?: GetCountryPlanResponse['strategic_priorities'];
}

// eslint-disable-next-line import/prefer-default-export
function StrategicPrioritiesTable(props: Props) {
    const {
        priorityData,
        className,
    } = props;

    const strings = useTranslation(i18n);
    type StrategicPriority = NonNullable<(typeof priorityData)>[number];

    const columns = useMemo(
        () => ([
            createStringColumn<StrategicPriority, number>(
                'title',
                strings.countryPlanStrategicPriority,
                (strategic) => strategic?.type_display,
            ),
            createNumberColumn<StrategicPriority, number>(
                'priority',
                strings.countryPlanKeyFigurePeopleTargeted,
                (strategic) => strategic?.people_targeted,
            ),
        ]),
        [
            strings.countryPlanStrategicPriority,
            strings.countryPlanKeyFigurePeopleTargeted,
        ],
    );

    return (
        <Table
            className={className}
            filtered={false}
            pending={false}
            data={priorityData}
            columns={columns}
            keySelector={numericIdSelector}
        />
    );
}

export default StrategicPrioritiesTable;
