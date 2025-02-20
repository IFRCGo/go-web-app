import { useMemo } from 'react';
import { Table } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type GetCountryPlanResponse = GoApiResponse<'/api/v2/country-plan/{country}/'>;

interface Props {
    className?: string,
    priorityData?: GetCountryPlanResponse['strategic_priorities'];
}

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
