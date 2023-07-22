import { useMemo } from 'react';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import Table from '#components/Table';
import { createNumberColumn, createStringColumn } from '#components/Table/ColumnShortcuts';
import { paths } from '#generated/types';
import { numericIdSelector } from '#utils/selectors';

import i18n from '../i18n.json';

type GetCountryPlan = paths['/api/v2/country-plan/{country}/']['get'];
type GetCountryPlanResponse = GetCountryPlan['responses']['200']['content']['application/json'];

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
                'title',
                strings.countryPlanStrategicPriority,
                (strategic) => strategic?.people_targeted,
            ),
        ]),
        [strings],
    );

    return (
        <Container
            className={className}
            heading={strings.countryPlanStrategicPrioritiesTableHeading}
            withHeaderBorder
        >
            <Table
                filtered={false}
                pending={false}
                data={priorityData}
                columns={columns}
                keySelector={numericIdSelector}
            />
        </Container>
    );
}

export default StrategicPrioritiesTable;
